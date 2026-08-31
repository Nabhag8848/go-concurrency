package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"time"
)

func spawnEcho() {
	cmd := exec.Command("echo", "hello-from-child-process")
	// New process. Wait until it exits. Capture stdout.
	out, err := cmd.Output()
	if err != nil {
		fmt.Println("spawn error:", err)
		return
	}
	fmt.Println("parent received:", string(out))
}

func spawnEchoRun() {
	cmd := exec.Command("echo", "hello-via-run")
	// Start + wait. Child stdout is the parent's terminal, not a []byte.
	err := cmd.Run()
	if err != nil {
		fmt.Println("run error:", err)
	}
}

func spawnStartWait() {
	cmd := exec.Command("sleep", "0.1")
	// Child is alive; this goroutine continues.
	err := cmd.Start()
	if err != nil {
		fmt.Println("start error:", err)
		return
	}
	fmt.Println("parent working while child PID", cmd.Process.Pid, "runs")
	// Join this PID, like WaitGroup.Wait.
	err = cmd.Wait()
	if err != nil {
		fmt.Println("wait error:", err)
		return
	}
	fmt.Println("child exited")
}

func waitForInterrupt(d time.Duration) {
	ch := make(chan os.Signal, 1)
	// Process-wide. This goroutine listens on ch.
	signal.Notify(ch, os.Interrupt)
	fmt.Println("waiting", d, "for SIGINT (Ctrl+C)")
	select {
	case s := <-ch:
		fmt.Println("got signal", s)
	case <-time.After(d):
		fmt.Println("no signal (timeout)")
		fmt.Println("exec is not called; it would replace this process")
	}
}

func main() {
	fmt.Println("-- spawn: Output (wait + capture stdout) --")
	spawnEcho()

	fmt.Println("-- spawn: Run (wait, no capture) --")
	spawnEchoRun()

	fmt.Println("-- spawn: Start + Wait (work, then join) --")
	spawnStartWait()

	fmt.Println("-- signals --")
	waitForInterrupt(200 * time.Millisecond)

	fmt.Println("unix.Exec / syscall.Exec would overlay this PID.")
	fmt.Println("os.Exit(code) would skip remaining defers.")
}
