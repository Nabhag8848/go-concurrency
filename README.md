# Concurrency from first principles (OS → Go)

Lessons live in `docs/`. Do not skip. If a sentence uses a word you have not earned (channel, park, race), go back.

```bash
go run ./docs/03-shared-memory-races
go run -race ./docs/03-shared-memory-races
```

| Order | Folder                               | Topics                                                           | Why here                               |
| ----- | ------------------------------------ | ---------------------------------------------------------------- | -------------------------------------- |
| 01    | `docs/01-process-thread`             | —                                                                | CPU, process, thread                   |
| 02    | `docs/02-scheduling`                 | —                                                                | scheduler, context switch              |
| 03    | `docs/03-shared-memory-races`        | —                                                                | why locks/channels exist               |
| 04    | `docs/00-defer-panic-recover`        | Defer, Panic, Recover                                            | stack unwind **before** goroutines     |
| 05    | `docs/00-defer-panic-recover` (same) | Exit                                                             | how a **process** dies                 |
| 06    | `docs/16-processes-signals-exit`     | Signals, Spawning Processes, Exec'ing Processes                  | other processes; not goroutines        |
| 07    | `docs/04-goroutines`                 | Goroutines                                                       | cheap thread of execution              |
| 08    | `docs/05-waitgroups`                 | WaitGroups                                                       | join; do this **before** Sleep-as-join |
| 09    | `docs/06-mutexes`                    | Mutexes                                                          | shared memory + lock                   |
| 10    | `docs/07-atomics`                    | Atomic Counters                                                  | one word, no mutex                     |
| 11    | `docs/08-channels`                   | Channels, Buffering, Synchronization, Directions, Closing, Range | pipe, then close, then range           |
| 12    | `docs/09-select-timeouts`            | Select, Non-Blocking, Timers, Tickers, Timeouts                  | timeout **is** select + timer          |
| 13    | `docs/10-worker-pools`               | Worker Pools                                                     | bound + job queue                      |
| 14    | `docs/14-rate-limiting`              | Rate Limiting                                                    | ticker as a gate                       |
| 15    | `docs/15-stateful-goroutines`        | Stateful Goroutines                                              | one owner instead of a mutex           |
| 16    | `docs/11-context`                    | Context                                                          | cancel; needs Done() as a channel      |
| 17    | `docs/12-deadlocks-leaks`            | —                                                                | stuck goroutines                       |
| 18    | `docs/13-gmp-runtime`                | —                                                                | how the runtime multiplexes            |

---

## 01–03. Operating system (read the NOTES, no shortcuts)

**CPU core:** one instruction stream at a time. Program counter + registers + stack pointer = a **thread of execution**.

**Process:** a program + a **private address space** (a house). Other processes do not see your memory.

**Thread (OS thread):** a worker _inside_ that house. Own stack and registers. **Shared heap and globals** with sibling threads. This is why two threads can corrupt `counter++`.

**Scheduler / context switch:** more threads than cores. The kernel saves one thread’s registers, loads another’s. Not free. ~1MB stacks. You cannot have 100k OS threads.

**Blocking:** thread waits on I/O; kernel parks it; core runs someone else.

**Race:** `x++` is load, add, store. Two threads can both load `0` and both store `1`. Run `./docs/03-shared-memory-races` and `go run -race`.

**Concurrent** = many works in flight (maybe one core). **Parallel** = two cores, same instant.

---

## Defer

**OS:** a function’s stack frame is destroyed on return. You still owe the kernel a `close()`, or another thread a lock release.

`defer f()` runs `f` when **this function** returns — normal return **or** panic. Multiple defers: **last in, first out**.

You will need this for `Unlock`, `Done`, `cancel`, `file.Close`. That is why it is before goroutines, not after worker pools.

```go
func f() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    fmt.Println("0")
}
// prints 0, then 2, then 1
```

Run `go run ./docs/00-defer-panic-recover`.

---

## Panic

**OS:** abort the process (uncaught fatal). Go `panic` unwinds **this goroutine’s** stack, runs its defers, then if nobody `recover`s, the **whole process** dies (every goroutine is gone).

Use panic for bugs (nil map, send on closed channel). Use `error` for “file missing.”

---

## Recover

`recover()` only works **inside a deferred call**. It stops the panic in **that goroutine only**.

A panic in a worker you never recover **crashes the program**. Servers often `defer recover()` at the edge of a request goroutine.

---

## Exit

**OS:** `_exit` — process vanishes. Status code to the parent.

| How you leave         | Defers in `main`? | Status  |
| --------------------- | ----------------- | ------- |
| `return` from `main`  | yes               | 0       |
| `panic` (unrecovered) | yes, then abort   | nonzero |
| `os.Exit(3)`          | **no**            | 3       |

`os.Exit` does not run defers. Do not use it as “return” if you still need cleanup.

---

## Signals

**OS:** the kernel interrupts a process (`SIGINT` from Ctrl+C, `SIGTERM` from systemd). `SIGKILL` cannot be caught.

Go does **not** make you write a C signal handler. `signal.Notify(ch, os.Interrupt)` turns the signal into a **channel send**. You `<-ch` or `select` and then shut down (cancel context, etc.).

Goroutines do not get signals individually. The **process** does. You decide which goroutine listens.

Run `go run ./docs/16-processes-signals-exit` (200ms timeout; Ctrl+C if you lengthen the wait).

---

## Spawning processes

**OS:** create a **new** process (`fork` + child runs a program, or equivalent). **Separate address space.** No shared goroutines, no Go channels. Communication = pipes, files, sockets, exit codes.

`os/exec`:

- `cmd.Run()` — start and wait until it exits
- `cmd.Start()` + `cmd.Wait()` — start, do other work, then join
- `cmd.Output()` — run, capture stdout

Parent Go program keeps running. Child is another machine image.

---

## Exec'ing processes

**OS:** `exec` **replaces** the current process. Same PID, new program. The Go runtime, all goroutines, all defers — **gone**. This is what a shell does for the last command, or a wrapper that becomes the real server.

Spawn = extra process beside you. Exec = you _become_ that binary (`unix.Exec` / `syscall.Exec`).

The lesson file explains this; the default `main` does not call `Exec` so you do not accidentally replace your shell’s child.

---

## Goroutines

**OS:** thread of execution = pause/resume a stack. OS thread = expensive kernel object. **Goroutine** = same idea in **user space**, many of them on few OS threads (M:N). Stacks start tiny (~2KiB) and grow.

`go f()` starts a goroutine. The caller does **not** wait.

When the **main goroutine** returns, the process exits. Other goroutines are abandoned.

```go
func GoRoutines() {
	function("direct")
	go function("goroutines")
	// ...
	time.Sleep(time.Second) // fake join — next topic replaces this
	fmt.Println("done")
}
```

`go f()` is **not** “new OS thread.” It is “new G; runtime will run it on some M.”

Run `go run ./docs/04-goroutines`.

---

## WaitGroups

**OS:** `pthread_join` waits for a kernel thread. The kernel does not know goroutines. `sync.WaitGroup` is a **user-space counter + sleep queue**.

- `Add(1)` **before** `go` (or `wg.Go` in recent Go)
- worker: `defer wg.Done()`
- parent: `wg.Wait()` until 0

`Wait` parks **this goroutine**. Other goroutines can still run on that OS thread.

Do **not** `Add` from inside the worker after the parent might already `Wait` (race: Wait sees 0 too early).

Join is how you stop using `Sleep`. WaitGroups come **before** worker pools.

Run `go run ./docs/05-waitgroups`.

---

## Mutexes

**OS:** lock. One thread of execution in the **critical section**; others park. Unlock is a **memory barrier**.

`mu.Lock(); shared++; mu.Unlock()`. Tiny critical section. Do not hold a lock across slow I/O. Always lock A then B, never reverse on another path (deadlock).

`RWMutex`: many readers **or** one writer.

WaitGroup answers “are they finished?” Mutex answers “who may touch this memory?” You often need both.

Run `go run ./docs/06-mutexes` and `go run -race ./docs/06-mutexes`.

---

## Atomic counters

CPU **atomic** instruction on a single integer (`atomic.AddInt64`). No mutex. Visibility is defined for that word.

Not for “update eight fields together.” That is a mutex or one stateful goroutine.

Run `go run ./docs/07-atomics`.

---

## Channels

**OS:** Unix pipe = bytes between **processes**. A Go channel = typed values between **goroutines** in one process. Send/receive is a **synchronization point** (receiver sees sender’s writes from before the send).

Unbuffered `make(chan T)`: send waits for a receiver (rendezvous). Send with no receiver = this goroutine sleeps forever (deadlock if everyone is asleep).

```go
messages := make(chan string)
go func() { messages <- "ping" }()
msg := <-messages
```

Run `go run ./docs/08-channels`.

---

## Channel buffering

`make(chan T, n)` — mailbox of size n. Send proceeds without a receiver until full, then blocks. Receive blocks if empty.

Buffer 2 lets **one** goroutine send twice, then receive twice. A third send without a receive **deadlocks** in that same goroutine.

Buffer is **backpressure**, not infinite async. A huge buffer is a hidden unbounded queue.

---

## Channel synchronization

A channel used only as a **done** flag: worker sends when finished; main receives and therefore **joins**.

One worker: one unbuffered receive. N workers: WaitGroup, or N receives, or close a channel after WaitGroup.

---

## Channel directions

`chan<- T` send-only, `<-chan T` receive-only. The compiler forbids the ping function from receiving. Same pipe, narrower permission — like passing a write-only FD.

---

## Closing channels

**OS:** hang up the pipe. Drain remaining bytes, then EOF.

`close(ch)`: no more **sends**. Receivers still get queued values. Then `v, ok := <-ch` has `ok == false`. Send on closed or close twice → **panic**.

**Only the sender closes.** Many senders: usually do not close; WaitGroup + stop another way.

---

## Range over channels

`for v := range ch` receives until the channel is **closed and empty**. Never closed → range blocks forever (**leak**).

Workers: `for job := range jobs` until the producer `close(jobs)`.

**Close, then range** — not the other way around. That is why this topic is after closing.

---

## Select

**OS:** `select`/`epoll` — sleep until **one of several** file descriptors is ready.

Go `select`: wait on several **channel** ops. If several are ready, **one at random** (not source order). If none ready, park (unless `default`).

---

## Non-blocking channel operations

`select` with `default`: try send/receive **now**; if it would block, take `default`. Like `O_NONBLOCK`.

Do not spin `select { default }` in a hot loop — that burns a core. If you need to wait, omit `default`.

Also `go run ./docs/09-select-timeouts`.

---

## Timers

**OS:** kernel timer wakes a thread later.

`time.NewTimer(d)` → `timer.C` receives **once** after d. `Stop()` cancels if it has not fired; if it already fired, `Stop` is false and you may still need to drain `C`.

Run `go run ./docs/09-select-timeouts`.

---

## Tickers

Repeating timer. `ticker.C` keeps firing until `Stop()`. **Stop does not close `C`.** A goroutine blocked on `<-ticker.C` can leak unless you also signal `done` (as in the example).

---

## Timeouts

Timeout = `select` the **result channel** or a **timer** (`time.After` / `NewTimer`).

It unblocks **this** goroutine. It does **not** kill the worker. If the worker later sends on an unbuffered channel with no receiver, **that** goroutine leaks. Buffer 1 or send with `select` on `ctx.Done()`.

`time.After` in a tight loop allocates many timers; prefer `NewTimer` + `Reset` when hot.

Timeout is a timer used inside select, so timers come first.

---

## Worker pools

**OS:** thread pool + job queue. Creating unbounded threads (or goroutines) still costs stacks and can crush a DB.

N worker goroutines, `jobs` channel, `results` channel, producer `close(jobs)`, workers `for range jobs`.

3 workers and 5 jobs ⇒ at most 3 running at once. Receiving N results is a join without WaitGroup **if every job sends exactly once**.

Run `go run ./docs/10-worker-pools`.

---

## Rate limiting

**OS:** token bucket — do not issue work faster than N per second.

In Go: a **ticker** (or a buffered channel you refill). Each request does `<-limiter` before proceeding. Burst = put extra tokens in a buffer first.

This is not a new primitive. It is Tickers + channel receive as a gate. That is why it is after both.

Run `go run ./docs/14-rate-limiting`.

---

## Stateful goroutines

**OS:** only one thread touches a piece of memory ⇒ no data race, no mutex. Everyone else **messages** that thread.

One goroutine owns a map. Others send `readOp` / `writeOp` on a channel and wait on a reply channel. The mutex is _implied_ by “only this goroutine runs the map code.”

Use when the protocol is request/response anyway. Use a mutex when many goroutines just poke a cache and a lock is simpler.

`select` on `ctx.Done()` so the owner can `return` (lesson 11). Cancel after clients are done; join the owner with a WaitGroup, not `Sleep`.

Run `go run ./docs/15-stateful-goroutines`.

---

## Context

**OS:** do not `pthread_cancel` from outside (locks, half-written files). **Cooperative cancel:** a flag workers check at safe points.

`context.Context` carries cancel, deadline/timeout, and (sparingly) request values. `ctx.Done()` is a channel. `select` on it like `time.After`.

Parent cancel cancels children. HTTP cancel when the client hangs up should reach your DB call.

`WithTimeout` / `WithCancel`: `defer cancel()` to free timers. Cancel does not run another goroutine’s defers; that goroutine must **return**.

Timeout (select) vs Context: timeout is local. Context is the tree you pass downward so **all** layers can stop.

After `cancel()`, `WaitGroup.Wait` is how `main` joins the worker (lesson 05). A `Sleep` is a guess.

Run `go run ./docs/11-context`.

---

## Deadlocks, leaks, and GMP

**Deadlocks / leaks** (`12-deadlocks-leaks`): circular wait; send with no receiver; range without close; timeout that abandons an unbuffered send.

**GMP** (`13-gmp-runtime`): G = goroutine, M = OS thread, P ≈ `GOMAXPROCS`. Picture **one P** first (one core: park G, run another G on the same M). Several Ps / work stealing only if `GOMAXPROCS` > 1. Channel wait parks G, not necessarily M. Blocking syscall may attach extra M. Netpoller parks Gs waiting on sockets.

---

## Cheat sheet (only after you have read the topics)

| Situation              | Tool                        |
| ---------------------- | --------------------------- |
| Fan-out, wait for all  | WaitGroup                   |
| Protect a struct       | Mutex                       |
| Hand off a value       | Channel                     |
| Whichever event first  | select                      |
| Bound parallelism      | worker pool                 |
| Max N per second       | rate limit (ticker)         |
| One owner of state     | stateful goroutine          |
| Stop a tree of work    | context                     |
| Single counter         | atomic or mutex             |
| Cleanup on return      | defer                       |
| Bug / truly fatal      | panic (recover at boundary) |
| Another program        | spawn (`exec.Command`)      |
| Become another program | exec                        |
| Ctrl+C                 | signal → channel → cancel   |
