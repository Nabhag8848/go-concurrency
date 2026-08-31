package main

import (
	"fmt"
	"os"
)

func deferOrder() {
	defer fmt.Println("defer 1")
	defer fmt.Println("defer 2")
	fmt.Println("body")
}

func recoverFromPanic() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("recovered:", r)
		}
	}()
	fmt.Println("about to panic")
	panic("boom")
}

func main() {
	fmt.Println("-- defer LIFO --")
	deferOrder()

	fmt.Println("-- panic + recover --")
	recoverFromPanic()
	fmt.Println("still running after recover")

	fmt.Println("-- os.Exit skips defers --")
	fmt.Println("commented so this program can finish")
	fmt.Println("os.Exit after a defer would skip that defer")

	// Uncomment to kill the process without running later defers.
	// os.Exit(3)
	defer fmt.Println("this runs because we did not Exit")
	// os.Exit(0)

	_ = os.Stdout
}
