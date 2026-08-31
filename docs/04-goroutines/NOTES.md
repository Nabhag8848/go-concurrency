# 04 — Goroutines

## OS first

You already know:

- OS thread = expensive kernel-scheduled worker with a fat stack
- thread of execution = “a sequence of instructions that can pause/resume”

A **goroutine** is a thread of execution implemented _by the Go runtime_,
not by the kernel.

Costs (orders of magnitude, not promises):

- OS thread stack: often ~1 MiB reserved
- goroutine stack: starts around 2 KiB, grows as needed

You can have hundreds of thousands of goroutines. You cannot sanely have
that many OS threads.

## Starting one

`go f(x)` means: create a new goroutine that will call `f(x)`. The caller
does **not** wait. Execution of `f` is concurrent with the caller.

The `main` goroutine is special: when it returns, the process exits, even
if other goroutines are still running. That is why lesson 03 used `Sleep`
and why lesson 05 exists (`WaitGroup`).

## M:N (the GMP picture, light version)

Go uses **M:N scheduling**:

- **G** (goroutine) — the work
- **M** (machine) — an OS thread
- **P** (processor) — a logical resource, roughly “a right to execute Go
  code”; there are about `GOMAXPROCS` of them

N goroutines run on M OS threads (M is usually near your CPU count, plus
extra threads stuck in syscalls).

When goroutine A waits on a channel, the runtime parks A and runs B on
the same OS thread. **No kernel context switch required.** That is the win.

When A calls a blocking syscall, M is stuck in the kernel. The runtime
can move P to another M so other Gs keep running.

## What to run

```bash
go run ./docs/04-goroutines
```

Read `main.go`. Notice: prints interleave. Order is not guaranteed. That
is the scheduler, not randomness for fun.

**Mental rule:** if you `go` something, you have created concurrent
access to whatever that function touches. Either don’t share, or
synchronize (later lessons).

Next: `05-waitgroups` — how to wait without `Sleep`.
