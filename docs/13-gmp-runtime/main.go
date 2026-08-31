package main

import (
	"fmt"
	"runtime"
	"sync"
	"time"
)

func main() {
	fmt.Println("GOMAXPROCS (parallel Go code):", runtime.GOMAXPROCS(0))
	fmt.Println("CPU cores:", runtime.NumCPU())
	fmt.Println("goroutines at start:", runtime.NumGoroutine())

	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			time.Sleep(200 * time.Millisecond)
		}()
	}

	time.Sleep(20 * time.Millisecond)
	fmt.Println("goroutines after 8 sleepers:", runtime.NumGoroutine())
	wg.Wait()
	fmt.Println("goroutines after Wait:", runtime.NumGoroutine())
}
