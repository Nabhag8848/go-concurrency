# 06 — Mutexes (and a little atomics)

## OS first

Lesson 03: 100 goroutines, `counter++`, no lock. You lost updates. `x++`
is load, add, store — two goroutines can both load `0` and both store `1`.

Lesson 05: `WaitGroup` only answers **“are they finished?”** It does not
stop them from touching the same variable at the same time. This file
is the same loop as lesson 03, plus a lock, plus a WaitGroup so `main`
does not print early.

A **mutex** (mutual exclusion) is a bathroom lock on a piece of memory.
Only one goroutine may be inside. Everyone else who calls `Lock` **parks**
(asleep, core free — lesson 01) until `Unlock`. Then one waiter is woken
and may enter.

If these were OS threads, the kernel would park the thread on a wait
queue. Goroutines are not kernel objects, so Go’s `sync.Mutex` does the
same job in user space: uncontended `Lock` is a cheap CPU instruction;
if someone already holds it, the runtime parks **this goroutine** and
can run other goroutines on that OS thread.

That is `sync.Mutex` plus the shared data it protects.

- `Lock()` — “this memory is mine now”
- `Unlock()` — “I am done; next waiter may enter”
- the code between them is the **critical section** — keep it tiny
  (`counter++` only, not a network call)

In `main.go`:

```go
mu.Lock()
counter++
mu.Unlock()
```

One goroutine at a time does the load/add/store. Expected `100000`, and
`go run -race` is quiet.

Unlock is also the **handshake** from lesson 03: when B later `Lock`s,
it is guaranteed to see A’s writes. The lock is what makes the whiteboard
update visible, not the `++` itself.

## Mutex vs WaitGroup

| Question                      | Tool        |
| ----------------------------- | ----------- |
| Are the workers finished?     | `WaitGroup` |
| May they share this variable? | `Mutex`     |

This program needs **both**: the mutex so `counter++` is not a race, the
WaitGroup so `main` prints after all increments.

A mutex does not pass values. It is not a queue of messages. It only
says “my turn with this memory.”

## Rules that save you

1. Same mutex for the same data. Every read and write of `counter` goes
   through `mu`. A forgotten unlocked access is still a race.
2. `Unlock` once per `Lock`. Prefer `defer mu.Unlock()` if the critical
   section can return or panic (lesson 00).
3. Do not copy a `Mutex` after use. Pass a pointer (same as WaitGroup).
4. Do not `Lock` and then do slow I/O. Everyone else waits on the door.

## RWMutex

`RLock` — many readers at once **or** one writer (`Lock`), never both.
Use when lots of goroutines only look and writes are rare. For a single
`int`, a plain mutex or an atomic is usually simpler.

## Atomics

A mutex serializes a **region of code** (as big as you like). An atomic
is a **CPU instruction on one word**: “add 1 to this `int64` as a single
step so nobody can see a half-done `++`.”

This lesson’s `counter` could have been an atomic instead of a mutex:

```go
var ops atomic.Int64

ops.Add(1)          // instead of Lock / counter++ / Unlock
n := ops.Load()     // instead of Lock / read / Unlock
```

Same idea as `counter++`, but the chip does load/add/store as one
uninterruptible step. No lock, no parking. Lesson 07 runs this.

It is the **wrong** tool when several fields must change **together**.
Two atomics are two separate steps. Another goroutine can run in between
and see a frankenstein value:

```go
type Account struct {
    mu      sync.Mutex
    balance int
    version int // must bump whenever balance changes
}

func (a *Account) Deposit(n int) {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.balance += n
    a.version++
}
```

Here `balance` and `version` are one invariant: “this version describes
this balance.” A mutex (or one owner goroutine, later) holds the whole
update. `atomic.Add` on each field separately would let a reader see the
new balance with the old version.

Rule of thumb: one integer or flag → atomic is fine. A struct that must
stay consistent → mutex (this lesson) or channels (next).

## What to run

```bash
go run ./docs/06-mutexes
go run -race ./docs/06-mutexes
```

Should print `100000`. The race detector should be quiet.

Go proverb you will hear: _“Do not communicate by sharing memory; share
memory by communicating.”_ That is channels (lesson 08). Mutexes are still
correct and often simpler for caches, counters, graphs. Use the tool
that matches the data.

Next: `07-atomics`
