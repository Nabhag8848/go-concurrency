package main

import (
	"fmt"
	"sync"
	"time"
)

// Uncomment deadlock() in main to see:
// fatal error: all goroutines are asleep - deadlock!
func deadlock() {
	ch := make(chan int)
	// No receiver. Unbuffered. This goroutine sleeps forever.
	ch <- 1
	fmt.Println(<-ch)
}

func leakFix() {
	// Buffer 1: send does not need a live receiver.
	ch := make(chan string, 1)
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done()
		time.Sleep(200 * time.Millisecond)
		select {
		case ch <- "work done":
		default:
			// Nobody listening. Refuse to block.
			// Would leak if unbuffered and main already moved on.
		}
	}()

	select {
	case msg := <-ch:
		fmt.Println(msg)
	case <-time.After(50 * time.Millisecond):
		fmt.Println("timeout")
		fmt.Println("worker may still finish")
		fmt.Println("but must not block forever on send")
	}

	wg.Wait()
}

func main() {
	// deadlock()
	leakFix()
}
