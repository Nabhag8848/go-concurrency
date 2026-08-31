package main

import (
	"fmt"
	"time"
)

func say(from string) {
	for i := 0; i < 3; i++ {
		fmt.Println(from, i)
		time.Sleep(50 * time.Millisecond)
	}
}

func main() {
	// Runs on the main goroutine (one OS thread of execution).
	say("direct")

	// Starts another goroutine. The runtime picks an OS thread.
	// You do not control which one.
	go say("goroutine")

	// Nothing here decides that "going" prints first.
	// Both are runnable; the scheduler picks who gets a core.
	go func(msg string) {
		fmt.Println(msg)
	}("going")

	// Still the wrong way to wait. Next lesson replaces this.
	time.Sleep(500 * time.Millisecond)
	fmt.Println("done")
}
