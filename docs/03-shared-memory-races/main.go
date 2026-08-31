package main

import (
	"fmt"
	"time"
)

// Two threads of execution, one shared variable, no lock.
// The scheduler interleaves the load/add/store of counter++.
// Lost updates are expected. Mutexes and channels exist to prevent this.

func main() {
	var counter int

	for i := 0; i < 100; i++ {
		go func() {
			for j := 0; j < 1000; j++ {
				counter++
			}
		}()
	}

	// Sleep is a bad way to wait for work (see WaitGroup).
	// Used here only so the race has time to happen before we print.
	time.Sleep(500 * time.Millisecond)
	const want = 100000
	lost := want - counter
	fmt.Printf("expected %d\n", want)
	fmt.Printf("got %d (lost %d)\n", counter, lost)
}
