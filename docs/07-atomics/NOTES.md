# 07 — Atomic counters

A mutex serializes a critical section of any size. An atomic is a CPU
instruction on **one word**.

`atomic.AddInt64(&ops, 1)` is safe from many goroutines without `Lock`.
It is the wrong tool for a struct of many fields that must change together.

Run: `go run ./docs/07-atomics` and `go run -race ./docs/07-atomics`

Next: `08-channels`
