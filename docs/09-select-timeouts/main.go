package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("-- timeout --")
	c1 := make(chan string, 1)
	go func() {
		time.Sleep(2 * time.Second)
		c1 <- "result 1"
	}()

	select {
	case res := <-c1:
		fmt.Println(res)
	case <-time.After(1 * time.Second):
		fmt.Println("timeout")
	}

	fmt.Println("-- select waits for the faster channel --")
	c2 := make(chan string, 1)
	go func() {
		time.Sleep(100 * time.Millisecond)
		c2 <- "result 2"
	}()
	select {
	case res := <-c2:
		fmt.Println(res)
	case <-time.After(1 * time.Second):
		fmt.Println("timeout")
	}

	fmt.Println("-- non-blocking (default) --")
	messages := make(chan string)
	select {
	case msg := <-messages:
		fmt.Println("received", msg)
	default:
		fmt.Println("no message")
	}

	fmt.Println("-- ticker (repeating timer) --")
	ticker := time.NewTicker(200 * time.Millisecond)
	done := make(chan bool)
	go func() {
		time.Sleep(500 * time.Millisecond)
		done <- true
	}()
	for {
		select {
		case <-done:
			ticker.Stop()
			fmt.Println("ticker stopped")
			return
		case t := <-ticker.C:
			fmt.Println("tick at", t.Format("15:04:05.000"))
		}
	}
}
