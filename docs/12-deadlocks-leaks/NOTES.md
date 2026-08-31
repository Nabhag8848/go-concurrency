# 12 — Deadlocks and goroutine leaks

## OS first

Lesson 01: **park** means asleep, core free, waiting for a wakeup.
Deadlock is when the wakeup **never comes**, and the waiters are waiting
on **each other**.

Classic picture with locks (lesson 06): A holds lock 1, wants lock 2.
B holds lock 2, wants lock 1. Both park. The kernel will not break the
cycle. If every path that takes A then B also takes B then A on another
path, that is the AB–BA deadlock. Same order everywhere, or don’t nest
locks.

Go has the same shape with **channels** (lesson 08). Unbuffered send
with no receiver: this goroutine parks. If it is the only one left (or
everyone else is also parked), nobody will receive. Forever.

If **all** goroutines are asleep, the Go runtime notices and panics:
`fatal error: all goroutines are asleep - deadlock!` That is a _full_
deadlock. A **leak** is sneakier: the rest of the program keeps going;
**one** goroutine stays parked forever (lesson 11: never looks at
`Done()`). Its stack is still there. Do that per request and RAM grows.

**Livelock:** everyone is running but making no progress (retry, retry).
**Starvation:** one worker never gets the lock or the next job.

## Walk `main.go`

### `deadlock()` (commented out)

```go
ch := make(chan int) // unbuffered
ch <- 1              // parks here
fmt.Println(<-ch)    // never reached
```

Go runs **one line after another** in this goroutine. `ch <- 1` must
**finish** before `fmt.Println(<-ch)` starts.

`ch` is unbuffered: a send finishes only when **another** goroutine is
already receiving (lesson 08 rendezvous). The only receive is the next
line, in **this same** goroutine. That line has not started. There is
no other G. So the send parks, waiting for a receive that will never
begin.

That is why the program never reaches line 13. Not because `Println` is
broken — because execution is stuck on the send **above** it. `main`
is waiting for itself.

Uncomment `deadlock()` in `main` when you want to **see** the runtime
detector (`all goroutines are asleep`). Leave it commented so
`leakFix()` can run.

### `leakFix()` (what `main` runs)

This is lesson 09’s timeout plus the abandoned worker.

`main` `select`s: receive from `ch`, or `time.After(50ms)`. The worker
sleeps **200ms**, so the timer wins. You print `timeout`. The worker is
**still going**.

If `ch` were **unbuffered**, the worker’s `ch <- "work done"` would park
forever — nobody is in a receive anymore. **Goroutine leak.**

This file uses two guards (either would do):

- **buffer 1** — send has a mailbox slot even if `main` moved on
  (lesson 09 `c1`)
- **`select` + `default` on the send** — if nobody is receiving _and_
  the buffer is full / unbuffered, take `default` and return instead of
  parking

The worker `defer wg.Done()`s. After the timeout `select`, `wg.Wait()`
is the join (lessons 05 / 11) — no trailing `Sleep`. If the worker
leaked on an unbuffered send, `Wait` would hang; with buffer + `default`
it returns.

## What to run

```bash
go run ./docs/12-deadlocks-leaks
```

You should see the timeout line. Uncomment `deadlock()` to hang and get
the runtime’s deadlock panic.

Next: `13-gmp-runtime` — deepen goroutines now that you have the primitives.
