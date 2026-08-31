# 11 — Context (cancellation and deadlines)

## OS first

Lesson 09: `select` + `time.After` unblocks **this** goroutine. The
worker may still be running. You have no “kill that goroutine” button.

You should not destroy a worker from the outside while it holds a lock
or is halfway through a write (lesson 06 / 00). The polite protocol is
**cooperative cancellation:** a shared “please stop.” Workers check it
at safe points and **return**. Then their `defer`s run.

Unix processes: `SIGTERM` asks, `SIGKILL` forces. Goroutines have no
SIGKILL. If a goroutine never looks at the flag and never returns, it
leaks until the process dies (lesson 12).

`context.Context` is that flag, passed down the call tree (HTTP handler
→ your code → DB driver). `ctx.Done()` is a **channel**. `select` on it
the same way you selected on `time.After` (lesson 09). `cancel()` (or a
deadline) closes that channel; every waiter wakes.

If a **parent** cancels, **children** cancel. Client hung up → request
context cancelled → in-flight query should stop, not finish for nobody.

## Walk `main.go`

### Timeout

```go
ctx, cancel := context.WithTimeout(context.Background(), 400*time.Millisecond)
defer cancel()
work(ctx, "job", nil)
```

`Background()` is the root: never cancelled. `WithTimeout` derives a
child that cancels itself after 400ms. **`defer cancel()`** still runs
(lesson 00): if you return early, the timer is freed. Always call the
`cancel` you are given.

`work` runs on **`main`** (no `go`). `nil` WaitGroup: `main` already
waits because the call does not return until the loop `return`s.
`work` skips `Done` when `wg == nil`.

The loop:

- `select` `<-ctx.Done()` → print `stopped:` + `ctx.Err()`, `return`
- `default` → print `working`, sleep 150ms

`default` means “don’t park on Done” (lesson 09). Between sleeps the
timeout fires; next loop sees Done. You get a few `working` lines, then
`job stopped: context deadline exceeded`.

Cancel does **not** run this function’s `defer` from the outside. The
loop must `return`. That is the whole model.

### Parent cancel

`WithCancel` — you call `stop()` yourself. `wg.Add(1)` then
`go work(parent, "child", &wg)` so `main` can cancel while the child
loops. After ~350ms `stop()` closes `Done`. Child prints `stopped:
context canceled` (`Err` is canceled, not deadline). `defer wg.Done()`
runs on that `return`.

`wg.Wait()` is the join (lesson 05). No `Sleep` after `stop()`: `Wait`
returns when the child has `return`ed and `Done`. If the child ignored
`Done()`, `Wait` would hang — that leak from the OS section, visible as
a stuck `Wait`.

## Rules

1. `ctx` is the first argument: `func Do(ctx context.Context, ...)`.
2. Do not stash Context in a random struct; pass it down.
3. `WithCancel` / `WithTimeout`: `defer cancel()`.
4. Cancellation is not `os.Exit` and not a panic. The goroutine must
   return so defers run.

## What to run

```bash
go run ./docs/11-context
```

Timeout job stops with `deadline exceeded`. Child stops with
`canceled` after `stop()`; `Wait` returns when that goroutine is gone.

Next: `12-deadlocks-leaks`
