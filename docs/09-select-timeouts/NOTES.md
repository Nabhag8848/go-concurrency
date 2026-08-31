# 09 — Select and timeouts

## OS first

Lesson 08: one send or one receive, on **one** channel. If it cannot
finish, **that goroutine parks**.

A server often waits on **several** things at once: data on connection
A, data on B, a timer, “parent said stop.” Unix does that with
`select` / `poll` / `epoll` / `kqueue`: sleep until **one of these file
descriptors is ready**, or a timeout fires. The thread is not spinning
(lesson 01).

Go’s `select` is the same shape for **channels**. Each `case` is one
channel op (receive or send). The goroutine parks until **one** case
can run.

```go
select {
case v := <-c1: // receive
case c2 <- x:   // send
case <-time.After(1 * time.Second): // timer is also a channel
}
```

Rules (the ones that surprise people):

- If **several** cases are ready, Go picks **one at random**. Source
  order is not priority (same idea as lesson 04: scheduler, not listing
  order).
- If **none** are ready, this goroutine **parks** — unless you add
  `default`.
- `default` = try now; if nothing is ready, take `default` and **do not
  wait**. That is not a timeout. A timeout is waiting _up to_ some
  duration.

A timer is not a busy loop. `time.After(d)` returns a channel that
receives once after `d`. The runtime (and the OS clock) wake you.

## Walk `main.go`

### Timeout (slow worker)

A goroutine sleeps 2s, then sends `"result 1"` on **buffered** `c1`
(size 1). `main` `select`s: receive from `c1`, **or** `time.After(1s)`.

The timer wins. You print `timeout`. The worker is **still asleep**;
select did not kill it. When it later sends, the buffer has room, so it
does not deadlock on `c1 <-`. An **unbuffered** `c1` here would park
that worker forever after `main` moved on (lesson 08: send with no
receiver). Buffer 1 is the “I gave up waiting, but let the send
complete” trick. Asking work to **stop** is lesson 11 (`context`).

### Faster channel

Same shape, but the worker sleeps 100ms and the timer is 1s. The receive
wins. You print `result 2`. Select waits for **whichever case is ready
first**.

### Non-blocking (`default`)

`messages` is unbuffered and empty. No sender. Without `default`,
`<-messages` would park forever. With `default`, you print `no message`
and continue. “Try once, else don’t wait.”

### Ticker

`NewTicker(200ms)` is a repeating timer: `ticker.C` keeps receiving
until `Stop()`. **`Stop` does not close `C`.** A goroutine blocked only
on `<-ticker.C` would never see “closed.” This demo also `select`s a
`done` channel: after 500ms someone sends `true`, `main` `Stop`s the
ticker and `return`s. You should see a couple of ticks, then `ticker
stopped`.

Stop tickers you no longer need, or you leak timers. `time.After` in a
**hot loop** also allocates a timer each time; `NewTimer` + `Reset` is
the production version. For this lesson, `After` is fine.

## Timeout vs default vs cancel

|                       | What it does                                     |
| --------------------- | ------------------------------------------------ |
| `select` + timer      | wait **up to** d, then this goroutine gives up   |
| `select` + `default`  | do **not** wait                                  |
| `context` (lesson 11) | ask **other** goroutines to stop at a safe point |

The goroutine that `select`s is the one that unblocks. The worker may
still be running.

## What to run

```bash
go run ./docs/09-select-timeouts
```

You should see `timeout`, then `result 2`, then `no message`, then ticks
and `ticker stopped`.

Next: `10-worker-pools` — the pattern that combines channels + WaitGroup + bound.
