# 10 — Worker pools

## OS first

Lessons 04–05: `go` is cheap, WaitGroup joins. Lesson 08: a channel is
a queue; `close` + `range` means “no more jobs.” Lesson 09: you can
wait on more than one channel. This lesson puts those together.

A **thread pool** is an old server idea. Creating OS threads is
expensive (lesson 02). Unbounded threads can exhaust the machine. So
you keep **N** workers (often ≈ cores, or a bit more if they block on
I/O). Jobs sit in a **queue**. A free worker pulls a job, runs it,
maybe pushes a result.

Goroutines are cheap, so people write `go handle(req)` per request.
The **bound** still matters:

- CPU-bound: more goroutines than cores mostly adds scheduling noise
- I/O-bound: more concurrency helps until sockets, FDs, or the DB melt
- each goroutine still owns a stack (small at first, grows). One
  million `go handle(req)` is not free RAM. And if every one of those
  immediately calls the same database or API, you did not just use
  memory — you opened a million concurrent connections. The _other_
  service falls over, then yours waits on I/O forever. The pool caps
  how many of those calls are in flight.

A worker pool is **at most N pieces of work running at once**, plus a
job channel as the queue.

## Walk `main.go`

3 workers, 5 jobs. Sleep is fake work. You will see worker IDs
**interleave**: job 4 and 5 start after someone finishes 1–3. That is
the pool — not five dedicated goroutines.

```go
jobs := make(chan int, numJobs)
results := make(chan int, numJobs)
```

Both are **buffered** to the job count, so `main` can send all five
jobs without waiting for a worker (lesson 08 mailbox). Unbuffered
`jobs` would be **backpressure**: the producer parks until a worker
receives. A huge buffer is a hidden unbounded queue — you only moved
the pile.

Each worker:

- `defer wg.Done()` (lesson 05; lesson 00)
- `for j := range jobs` until `jobs` is closed **and** empty (lesson 08)
- send `j * 2` on `results`

`jobs <-chan int` / `results chan<- int`: workers only take jobs and
only send results (lesson 08 directions).

`main` starts 3 workers (`Add` **before** `go`), sends 1…5, then
**`close(jobs)`**. That is “no more work.” Workers exit the range,
send on `results`, then `Done`. WaitGroup hits 0.

This file `Wait`s and `close(results)` in a **goroutine** so `main` can
`range` at the same time.

You could instead do `wg.Wait(); close(results)` **in main** before
the range. That works **here** because `results` is buffered to
`numJobs`, so every send already finished before `Wait`. If `results`
were unbuffered, `Wait` in `main` would deadlock (workers stuck on
send, `main` stuck on `Wait`) — then Wait+close **must** run in a
goroutine so `main` can range at the same time.

Close **after** Wait so no worker sends on a closed channel (panic).
Range on results is the join for outputs; WaitGroup is the join for
the workers.

Why not `go` five times with no pool? You would have five running at
once. Here at most **three** `Sleep`s overlap. That is the whole
point.

## What to run

```bash
go run ./docs/10-worker-pools
```

You should see starts/finishes mixed across workers 1–3, then five
`result` lines (2, 4, 6, 8, 10, any order the sends completed).

Next: `11-context` — stopping work you already started.
