# 05 — WaitGroups

## OS first

Lesson 04 used `time.Sleep` to wait for goroutines. That is a guess: too
short and `main` exits while they still run; too long and you waste time.
You want **wait until they are actually finished**.

If these were **OS threads**, the kernel could do that for you. Each
thread is a kernel object. “Join” means: this thread **blocks** (asleep,
core free — lesson 01) until _that_ thread has exited. The OS knows both
exist, so it can wake the waiter at the right moment.

A **goroutine** is not an OS thread. The kernel has no name for it and
cannot join it. `WaitGroup` is the user-space version of that join: your
program counts “how many tasks are still running” and parks whoever
calls `Wait` until the count is 0.

That is `sync.WaitGroup`: a counter plus a sleep queue.

- `Add(n)` — “I am launching n units of work”
- `Done()` — “one unit finished” (usually `defer wg.Done()`)
- `Wait()` — park this goroutine until the counter hits 0

OS mapping: `Wait` **blocks the goroutine**, not necessarily the OS thread
forever. The runtime parks the waiter and can run other goroutines on that
thread. When the last `Done` happens, the waiter is made runnable again.

## Rules that save you

1. `Add` **before** `go`, or while you still hold the “I know the count”
   invariant. Never `Add` from inside the worker unless the parent already
   accounted for it. The classic bug: `Wait` sees 0, returns, then a worker
   `Add`s too late.
2. `Done` exactly once per `Add(1)`.
3. Do not copy a `WaitGroup` after use. Pass a pointer.

## What to run

```bash
go run ./docs/05-waitgroups
```

This is the correct replacement for `time.Sleep` in lessons 03–04.

Next: `06-mutexes` — joining is not the same as protecting shared data.
WaitGroup only answers “are they finished?”, not “did they corrupt memory?”
