# 14 — Rate limiting

## OS first

Lesson 10: a **worker pool** caps how many jobs run **at once**. Rate
limiting caps how often work **starts** — at most N per second, even if
you have idle workers.

The kernel will not do that for you. A process can `connect()` as fast
as it wants and knock over a DB or an API. The usual picture is a
**token bucket**: you must take a token before you proceed. Tokens
appear on a clock. Empty bucket → you **park** (lesson 01 / 08) until
the next token.

Lesson 09: a **ticker** is that clock. `<-ticker.C` receives once per
interval. Receiving **is** the gate: you do not start the request until
a tick (or a stored token) arrives. Create it with `time.NewTicker`,
not `time.Tick`, so you can `Stop()` when you are done.

A **burst** is extra tokens sitting in a mailbox (buffered channel,
lesson 08). You can spend them immediately, then you are back to one
token per tick.

This file is not a new primitive. It is ticker + channel receive.

## Walk `main.go`

### One every 200ms

Five ints sit in a buffered `requests` channel, then `close` (lesson
08 / 10). `limiter := time.NewTicker(200 * time.Millisecond)` — receive
from `limiter.C` every 200ms.

```go
for req := range requests {
    <-limiter.C   // park until the next tick
    fmt.Println("request", req, ...)
}
limiter.Stop()
```

Prints should be ~200ms apart. The loop is **on main**. No pool. The
bound is **time**, not “3 goroutines.” `Stop()` after the five requests
so the ticker does not keep firing.

### Burst of 3, then 200ms

`bursty` is `chan time.Time` with **capacity 3**. The loop fills it
with three `time.Now()` values — three tokens already in the mailbox.

A goroutine then `range`s `refill.C` (`NewTicker(200ms)`) and **sends**
those ticks into `bursty`. That is the slow refill. If the mailbox is
full, that send parks (backpressure). `defer refill.Stop()` when `main`
returns.

Five `burstyReq`s: each does `<-bursty` then prints. The first **three**
can run at once (tokens waiting). Requests 4 and 5 wait for the refill
goroutine. You should see a clump of three timestamps, then two more
~200ms apart.

`Stop()` does not close `C` (lesson 09), so `range refill.C` does not
end by itself. This demo then returns from `main`, so the process exits.

## What to run

```bash
go run ./docs/14-rate-limiting
```

First block: five lines, ~200ms between them. Second: three close
together, then two slower.

Next: `15-stateful-goroutines` — one owner instead of a mutex.
