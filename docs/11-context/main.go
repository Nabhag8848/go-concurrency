package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func work(ctx context.Context, name string, wg *sync.WaitGroup) {
	if wg != nil {
		defer wg.Done()
	}

	for {
		select {
		case <-ctx.Done():
			fmt.Println(name, "stopped:", ctx.Err())
			return
		default:
			fmt.Println(name, "working")
			time.Sleep(150 * time.Millisecond)
		}
	}
}

func main() {
	var wg sync.WaitGroup

	fmt.Println("-- timeout --")

	ctx, cancel := context.WithTimeout(context.Background(), 400*time.Millisecond)
	defer cancel()
	work(ctx, "job", nil)

	fmt.Println("-- parent cancel --")
	parent, stop := context.WithCancel(context.Background())
	wg.Add(1)
	go work(parent, "child", &wg)
	time.Sleep(350 * time.Millisecond)
	stop()
	wg.Wait()
	fmt.Println("main: parent cancelled")
}
