package main

import (
	"fmt"
	"time"
)

func main() {
	requests := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		requests <- i
	}
	close(requests)

	limiter := time.NewTicker(200 * time.Millisecond)

	fmt.Println("-- one every 200ms --")
	for req := range requests {
		<-limiter.C
		fmt.Println("request", req, time.Now().Format("15:04:05.000"))
	}
	limiter.Stop()

	fmt.Println("-- burst of 3, then 200ms --")
	bursty := make(chan time.Time, 3)
	for i := 0; i < 3; i++ {
		bursty <- time.Now()
	}
	refill := time.NewTicker(200 * time.Millisecond)
	defer refill.Stop()
	go func() {
		for t := range refill.C {
			bursty <- t
		}
	}()

	burstyReq := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		burstyReq <- i
	}
	close(burstyReq)
	for req := range burstyReq {
		<-bursty
		fmt.Println("burst request", req, time.Now().Format("15:04:05.000"))
	}
}
