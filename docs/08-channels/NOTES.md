# 08 — Channels

## OS first

Lessons 03–07 were **one house, one whiteboard**. Two goroutines touch
the same variable. You either lose updates (03), lock a region (06), or
let the CPU do `++` as one step on a single word (07). WaitGroup (05)
only answers “are they finished?” — it does not move data.

There is another way: **do not share the whiteboard**. Pass a note.
Unix already does this **between processes**: a **pipe**. Bytes go in
one end, come out the other. Neither process walks into the other’s
address space (lesson 01).

A Go **channel** is that pipe **inside one process**, between
goroutines, with a type (`chan string`, `chan int`). The channel object
is shared. The _payload_ is handed off. After a send, the sender should
treat that value as the receiver’s problem (especially if it is a
pointer).

Send and receive are a **handshake**, same job as mutex Unlock then
Lock (lesson 03 visibility). The receiver is guaranteed to see
everything the sender did **before** the send. You do not need a mutex
on the value you just copied through the channel.

A send or receive is an operation **on a goroutine that already
exists**. The channel does not spawn one. `go ping(...)` starts a
goroutine; `messages <- "buffered"` is **`main` sending**. If the op
cannot finish, **that same goroutine parks** (lesson 01): not spinning,
core free. If _every_ goroutine is parked, deadlock (lesson 12).

## Walk `main.go`

### Rendezvous (unbuffered)

`make(chan string)` has **no mailbox**. Send waits until a receive is
happening, and receive waits until a send is happening. Both goroutines
meet.

`ping` may only **send** (`chan<- string`). `pong` takes from `pings`
and sends onto `pongs`. `main` receives `<-pongs` and prints `hello`.
That receive is the join — no `Sleep`, no WaitGroup.

Unbuffered does **not** store N values. Extra `go ping`s (try it, then
undo) each park **that** goroutine on `pings <-`. Many senders = a line
of waiters, each still holding their string. One `pong` receive takes
**one** of them. Which string you would print is the scheduler, not
source order (lesson 04); leftover senders stay parked until exit.

### Buffered

`make(chan string, 2)`: `main` sends twice without another goroutine
receiving. OS picture: a **bounded queue**. The bound is backpressure.

Send does not need a receiver until the mailbox is **full**. Then send
parks until someone receives — not always deadlock (another goroutine
can receive). Deadlock if it is full **and nobody will ever receive**.
Uncomment `messages <- "nabhag"`: `main` parks on the third send; the
receives are the lines **below**, so `main` waits for itself. Unbuffered
is the same rule with `n = 0` (already “full” before any send).

### Close and range

A producer sends `1, 2, 3` and **`close(jobs)`**. `for j := range jobs`
receives until the channel is closed **and empty**. Close means “no more
**sends**.” Remaining values still come out. Then range stops.

**Only the sender closes.** Close twice or send on a closed channel →
`panic` (lesson 00). Several senders: usually **do not** close; use a
WaitGroup, or a separate `done` channel (later).

## Direction

`chan<- T` send-only, `<-chan T` receive-only. Give functions the
narrowest type. The compiler is a seatbelt: `ping` cannot accidentally
receive.

## Mutex vs channel (so far)

| You need                        | Tool           |
| ------------------------------- | -------------- |
| Are they finished?              | WaitGroup (05) |
| Many goroutines poke one struct | Mutex (06)     |
| One integer / flag              | Atomic (07)    |
| Hand a value to another worker  | Channel (this) |

The proverb: _do not communicate by sharing memory; share memory by
communicating._ Channels are that proverb. Mutexes are still right for
a cache. Use the tool that matches the data.

## Unbuffered vs buffered

|            | **Unbuffered** `make(chan T)`            | **Buffered** `make(chan T, n)`                           |
| ---------- | ---------------------------------------- | -------------------------------------------------------- |
| Mailbox    | none — a handshake, not a queue          | up to **n** values sitting in the channel                |
| Send       | parks until a **receive is happening**   | parks only when the mailbox is **full**                  |
| Receive    | parks until a **send is happening**      | parks only when the mailbox is **empty**                 |
| OS picture | rendezvous / handoff                     | bounded queue / pipe with a small buffer                 |
| This file  | `pings` / `pongs` — `hello`              | `messages` capacity 2; `jobs` capacity 5                 |
| Good for   | signaling, “meet me,” a done token       | decoupling producer and consumer, backpressure           |
| Trap       | send with no receiver → park **forever** | **n** too large → hidden memory; **n** = 0 is unbuffered |

Same for both: `close` is “no more sends”; range drains then stops; send
on closed / close twice → panic; happens-before still holds on every
successful send/receive. Park on send when you cannot hand the value
off. Deadlock when **every** goroutine is parked and nobody is left to
receive.

## What to run

```bash
go run ./docs/08-channels
```

You should see `hello`, then the two buffered strings, then jobs `1 2 3`.

Next: `09-select-timeouts` — waiting on more than one channel, including time.
