# 13 — The Go runtime (GMP, preemption, syscalls)

You now have the primitives. This lesson is “how is this even possible?”
You do not need it to write correct programs. You need it when something
is slow, stuck, or using too many OS threads.

## OS first

Lesson 01: a **CPU core** runs one thread of execution at a time. The
**kernel** schedules **OS threads**. Lesson 02: switching those threads
is not free. Lesson 04: a **goroutine** is a user-space thread of
execution. The kernel has no name for it.

So something in **your process** must pick which goroutine runs on which
OS thread. That something is the Go scheduler. The usual names:

- **G** — goroutine. Stack, program counter, runnable / parked.
- **M** — “machine.” An **OS thread**. The kernel’s worker.
- **P** — “processor.” A token: “this M may run Go code right now.”
  Count ≈ `GOMAXPROCS` (default: number of CPU cores — lesson 01).

To run Go code you need **G + M + P**. If a G is parked on a channel
(lesson 08), that G is off the core. The M can run a different G with
the same P. **No kernel context switch** for that hop. That is the win
over one OS thread per task.

If a G makes a **blocking syscall** (`read` on a slow file), the M is
stuck in the kernel. The runtime can hand the P to **another** M so
other Gs keep running. Extra Ms exist for that; `GOMAXPROCS` does **not**
cap them.

Sockets are different. The **netpoller** registers FDs with
`epoll`/`kqueue` (lesson 09). A G waiting on HTTP is parked; it is
**not** sitting on an M the whole time. That is why 10,000 blocked
request goroutines can still be a handful of OS threads.

**Work stealing** (why you do not pin goroutines to cores):

You start 8 Gs (this lesson’s `main.go`). You have, say, 4 Ps — four
“rights to run Go code,” often one per core. Each P keeps its **own
list** of runnable Gs (a local run queue). When you `go f()`, the new G
usually lands on **whichever P is running the `go`** — like dropping
tickets on one waiter’s rail, not splitting them evenly by hand.

If that P is busy and another P is idle, the idle one **steals**: it
takes Gs from a neighbor’s queue (or from a global queue). You never
wrote “run this G on core 2.” Lesson 04 already: you do not pick who
runs first. Work stealing is that idea **across cores** — idle Ps grab
work so all cores stay busy.

Empty local queue → steal. That is the whole phrase.

**Preemption** (who yanks a G off the core):

Lesson 02: the kernel can interrupt an **OS thread** mid-loop.

The Go runtime can do the same to a **goroutine**: take the P back so
another G can run, even if this G is in a tight loop. You do not have
to call a channel or `Sleep` for the scheduler to get a turn.

You should still **park** when you mean to wait (channel, `select`,
`Sleep`). Do not busy-wait (lesson 01 spin). Preemption is a safety
net, not how you wait on purpose.

## Walk `main.go`

```go
runtime.GOMAXPROCS(0) // 0 means “read, don’t change”
runtime.NumCPU()
runtime.NumGoroutine()
```

First print: how many **P**s may run Go code at once. Second: cores.
Third: Gs right now (`main` plus extras the runtime keeps).

Then 8 goroutines `Sleep(200ms)` with a WaitGroup. A short `Sleep(20ms)`
in `main` **peeks** at `NumGoroutine` while they are still asleep — if
you only `Wait`ed first, they would already be gone. You should see the
count jump by about 8, then after `Wait` fall back.

The 8 Gs are not 8 OS threads. They are 8 parked Gs on a few Ms.

## `GOMAXPROCS` again

Caps how many goroutines run **Go code in parallel**. Does not cap how
many Gs you create. Does not cap Ms stuck in syscalls.

## What you already wrote, as runtime objects

| You write          | Runtime does                                   |
| ------------------ | ---------------------------------------------- |
| `go f()`           | allocate G, put on a run queue                 |
| `ch <- x` / `<-ch` | park G, maybe wake the other side              |
| `mu.Lock()`        | atomic or park G on the mutex wait list        |
| `wg.Wait()`        | park G until the counter is 0                  |
| `select`           | park G on several chans; first winner wakes it |
| `ctx.Done()`       | close a channel → `select` wakes               |

## How to choose a tool

| Situation                   | Tool            |
| --------------------------- | --------------- |
| Fan-out, wait for all       | WaitGroup       |
| Protect a struct in memory  | Mutex           |
| Hand off a value / pipeline | Channel         |
| Whichever event first       | select          |
| Bound parallelism           | worker pool     |
| Stop on cancel or deadline  | context         |
| Single counter              | atomic or mutex |

Default when unsure: **don’t share**. Each goroutine owns its data.
Results on a channel. Mutex only when a shared structure is clearly
simpler.

## What to run

```bash
go run ./docs/13-gmp-runtime
```

You should see `GOMAXPROCS`, CPU count, then goroutine counts before /
during / after the 8 sleepers.

You are done with the numbered path. Re-read 01 if a sentence here felt
unearned. Then `go run -race` on lesson 03 until shared memory feels
dangerous on sight.

Next in the folder numbering: `14-rate-limiting` (ticker as a gate),
then `15-stateful-goroutines`, then `16-processes-signals-exit` if you
skipped it earlier.
