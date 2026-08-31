package main

import "fmt"

func ping(pings chan<- string, msg string) {
	pings <- msg
}

func pong(pings <-chan string, pongs chan<- string) {
	msg := <-pings
	pongs <- msg
}

func main() {
	fmt.Println("-- rendezvous (unbuffered) --")
	// Capacity 0: send parks until a receive is happening.
	pings := make(chan string)
	pongs := make(chan string)
	go ping(pings, "hello")
	go pong(pings, pongs)
	// Main receives. The channel is the join.
	fmt.Println(<-pongs)

	fmt.Println("-- buffered --")
	// Mailbox of 2. No receiver needed until it is full.
	messages := make(chan string, 2)
	messages <- "buffered"
	messages <- "channel"
	// Deadlock if uncommented: full, and receive is below.
	// messages <- "nabhag"
	fmt.Println(<-messages)
	fmt.Println(<-messages)

	fmt.Println("-- close and range --")
	jobs := make(chan int, 5)
	go func() {
		for j := 1; j <= 3; j++ {
			jobs <- j
		}
		// No more sends. Range stops after drain.
		close(jobs)
	}()
	for j := range jobs {
		fmt.Println("job", j)
	}
}
