# 15 — Stateful goroutines

## OS first

Lesson 03 / 06: two goroutines, one map (or one `counter`) → race, unless
a **mutex** makes a critical section. Only one G runs the map code at a
time because they take turns holding the lock.

There is another way to get “only one thread of execution touches this
memory”: **only one goroutine is allowed to**. Everyone else **messages**
that owner (lesson 08: pass a note). No `Lock` on the map. The mutex is
_implied_ by “this G is the only one that runs `state[k] = v`.”

OS picture: one worker at one desk. Others do not walk over and write
on the paper. They put a slip in the inbox and wait for a slip back.
The desk is the map. The inbox is a channel. The reply channel is
“here is your answer” (a rendezvous, lesson 08).

Lesson 09 `select`: the owner waits on **reads, writes, or cancel**.
Lesson 05: one WaitGroup joins the **clients**. After `stop()`, a second
WaitGroup joins the **owner** (lesson 11). Context does not kill a G;
the owner must `return`.

Use this when the protocol is already request/response. Use a mutex
when many goroutines just poke a cache and a lock is simpler.

## Walk `main.go`

```go
type readOp struct {
    key  int
    resp chan int
}
type writeOp struct {
    key, val int
    resp     chan bool
}
```

Each request carries a **private reply channel**. The client sends the
struct, then `<-resp`. That receive is the handshake: when it completes,
the owner has already done the map op (lesson 03 visibility).

One owner goroutine. `owner.Add(1)` before `go`; `defer owner.Done()`
inside. Only this G indexes `state`:

```go
select {
case r := <-reads:
    r.resp <- state[r.key]
case w := <-writes:
    state[w.key] = w.val
    w.resp <- true
case <-ctx.Done():
    fmt.Println("owner: context done")
    return
}
```

`reads` and `writes` are **unbuffered**. The client parks until the
owner takes the op. The owner parks until the client takes `resp`.
`go run -race` is quiet with no mutex.

Ten clients: each `writeOp{key: i, val: i * 10}`, `writes <- w`, wait
`<-w.resp`, `Done`. `wg.Wait()` then `main` sends one `readOp` for key
`3` and prints `state[3] = 30`.

**Then** `stop()`. Clients are finished, so nobody is parked on
`writes <-` / `reads <-` with no owner. `Done` closes; the owner is in
`select`, takes that case, prints, `return`s, `owner.Done()`.
`owner.Wait()` returns when that has happened — same join as lesson 11.
A `Sleep` after `stop()` is a guess: too short and you miss the print;
the process may still exit while the owner is running.

Cancel is cooperative. If the owner were stuck on `r.resp <-` (client
had not received yet), it would not see `Done` until that send finished.

## Mutex vs owner

|                       | Mutex (06)               | This lesson             |
| --------------------- | ------------------------ | ----------------------- |
| Who runs the map code | whoever holds `Lock`     | one dedicated G         |
| Clients               | `Lock` / poke / `Unlock` | send op, wait on `resp` |
| Extra channels        | none                     | one `resp` per request  |

Same invariant: one thread of execution on that memory at a time.

## What to run

```bash
go run ./docs/15-stateful-goroutines
go run -race ./docs/15-stateful-goroutines
```

You should see `state[3] = 30`, then `owner: context done`. The race
detector should be quiet.

Next: `16-processes-signals-exit` — other processes, signals, exit.
