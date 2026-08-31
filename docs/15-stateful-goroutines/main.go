package main

import (
	"context"
	"fmt"
	"sync"
)

type readOp struct {
	key  int
	resp chan int
}

type writeOp struct {
	key  int
	val  int
	resp chan bool
}

func main() {
	reads := make(chan readOp)
	writes := make(chan writeOp)
	ctx, stop := context.WithCancel(context.Background())

	var owner sync.WaitGroup
	owner.Add(1)
	// Only this G touches the map.
	// Clients send ops; replies go on resp.
	go func() {
		defer owner.Done()
		state := make(map[int]int)
		for {
			select {
			case r := <-reads:
				r.resp <- state[r.key]
			case w := <-writes:
				state[w.key] = w.val
				w.resp <- true
			case <-ctx.Done():
				fmt.Println("owner: context done")
				return
			}
		}
	}()

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			w := writeOp{key: i, val: i * 10, resp: make(chan bool)}
			writes <- w
			// Park until the owner has stored the value.
			<-w.resp
		}(i)
	}
	wg.Wait()

	r := readOp{key: 3, resp: make(chan int)}
	reads <- r
	fmt.Println("state[3] =", <-r.resp)
	stop()
	// Join until the owner has returned.
	owner.Wait()
}
