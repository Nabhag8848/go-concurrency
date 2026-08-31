# 00 — Defer, panic, recover, exit

These are **stack and process** tools, not concurrency primitives. Later
lessons still need them: `defer Unlock` / `defer Done` / `defer cancel`,
and a panic in a goroutine that nobody recovers **kills the whole
process**.

Walk `main.go` in order. Run: `go run ./docs/00-defer-panic-recover`

## Defer

`defer` is how you **ensure a call happens later**, when the **enclosing
function** returns — usually cleanup (`Close`, `Unlock`, `Done`). Other
languages call this `finally` / `ensure`.

In `deferOrder`:

```go
defer fmt.Println("defer 1")
defer fmt.Println("defer 2")
fmt.Println("body")
```

The body runs first (`body`). Then deferred calls run in **LIFO** (last
in, first out): `defer 2`, then `defer 1`. Same pattern as open a file,
write, `defer close`: you register close right after open, and it still
runs at the end of the function.

Defers still run if the function **panics**. That is why recover can live
in a `defer`.

## Panic / recover

A `panic` means something went **unexpectedly** wrong (a bug, not “file
missing” — that should be an `error`). It starts unwinding **this
goroutine’s** stack. If nobody recovers, the **process** dies: stack
trace, nonzero exit, every other goroutine gone.

`recover` can stop that and let the program continue. It **only works
inside a deferred function**. In `recoverFromPanic` that is the first
thing registered:

```go
defer func() {
    if r := recover(); r != nil {
        fmt.Println("recovered:", r)
    }
}()
fmt.Println("about to panic")
panic("boom")
```

What happens: print `about to panic`, then `panic("boom")`. The rest of
`recoverFromPanic` is skipped. The deferred closure runs; `recover()`
returns `"boom"` (the value passed to `panic`). You print `recovered:
boom`. Control returns to `main`, which prints `still running after
recover`.

If that `defer recover` were missing, `panic("boom")` would abort the
process and you would never see “still running.”

A useful picture: a server should not die because one request panics.
Recover at the edge of that goroutine, drop the request, keep serving.
`net/http` does this by default.

## Exit

`os.Exit(code)` is “die **now**” with that status. Defers **do not
run**. Returning from `main` **does** run defers (status 0).

The `os.Exit` calls in `main` are **commented** so this program can
finish and you can see the last defer. The print is the lesson: if you
uncomment `os.Exit(3)` **after** `defer fmt.Println("this runs because
we did not Exit")`, that line never prints — Exit does not unwind the
stack, it just terminates. Uncomment `os.Exit(3)` **before** that
`defer` and the defer is never even registered.

`return` from `main` would still run `this runs because we did not Exit`.

Go does not use `main`’s return value as the exit status (unlike C).
Nonzero status → `os.Exit`.

Next: `01-process-thread` if you have not read it; then
`16-processes-signals-exit` before goroutines, or skip to
`04-goroutines` after OS lessons 01–03.
