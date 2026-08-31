# 03 — Shared memory and race conditions

## OS first

Two threads, one house, one whiteboard (`var x int`).

**Race condition:** the result depends on _who runs when_. The scheduler
is allowed to interleave instructions in ways you did not imagine.

**Atomicity:** `x++` looks like one line. On the CPU it is often:

1. load x from memory into a register
2. add 1
3. store the register back to memory

If two threads both load `0`, both add, both store `1`, you lost an update.
That is a **data race** when they unsynchronized-share a variable.

**Visibility (why “I wrote it” is not enough):** each core has its own
cache (lesson 02). Thread A can store `x = 1` into *its* cache and keep
running. Thread B, on another core, can still load the old `0` from
*its* cache. The write has not become visible yet. Compilers and CPUs
also **reorder** instructions for speed, so B might see A’s writes in
an order A did not write them.

A **happens-before** edge is a guaranteed “B will see A’s write.” You
do not get that from a plain `x = 1`. You get it from a
**synchronization event**: unlocking a mutex that B then locks, an
atomic store that B then loads, sending on a channel that B receives.
Those operations flush / invalidate caches and forbid the bad
reorderings. Informal rule: the lock (or channel, or atomic) is the
handshake that makes the whiteboard update visible to the other person.

The **Go memory model** is the written contract for that handshake. If
you only share data using the primitives in later lessons, the runtime
owes you visibility and ordering. If two goroutines both touch a
variable with no mutex / atomic / channel between them, there is no
handshake — that is a data race, and the program is undefined (the
detector is what screams in `go run -race`).

## What to run

```bash
go run ./docs/03-shared-memory-races
go run -race ./docs/03-shared-memory-races
```

The first often prints a number **less than 100000**. The second should
scream DATA RACE. That scream is the whole lesson.

Then open `main.go` and read it. The “fix” is not in this folder — mutexes
and channels are the fixes. First you must _see_ the bug.

Next: `04-goroutines`
