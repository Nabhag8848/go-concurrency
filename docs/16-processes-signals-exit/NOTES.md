# 16 — Signals, spawn, exec, exit

## OS first

Lesson 01: a **process** is a house (PID, address space). A **goroutine**
is a person in _this_ house (lesson 04). Channels, mutexes, WaitGroups
are all inside one process. This lesson is the doors to **other** houses,
plus how the kernel knocks on _this_ one.

**Spawn** is `fork` + the child runs a program (or the equivalent). New
PID, **separate** memory. The parent’s map is not the child’s map. No
Go race between them. Talk with pipes, files, sockets, exit status.

**Exec** is not a second house. It **overlays this PID**: same process
number, different binary. The Go runtime, every goroutine, every
`defer` — gone. A shell does this for the last command so it does not
leave a leftover parent.

**Signals** are the kernel interrupting the **process** (`SIGINT` from
Ctrl+C, `SIGTERM` from systemd). `SIGKILL` cannot be caught. Goroutines
do not each get a signal. You pick one G that listens (lesson 09
`select`) and then cancel the rest (lesson 11).

**Exit** is how this house vanishes (`_exit`, status to the parent).
Lesson 00: `return` from `main` runs defers (status 0). `os.Exit` does
not. This file does not call `os.Exit` or `Exec`, so `go run` stays
safe.

## Walk `main.go`

### Spawn

```go
cmd := exec.Command("echo", "hello-from-child-process")
out, err := cmd.Output()
```

`Command` is “run this argv.” `Output` starts the child, waits until it
exits (a join, like WaitGroup but for a PID), and returns stdout. You
print `parent received: hello-from-child-process`. The child is another
process; it is gone when `Output` returns.

`Run` is wait without capturing. Stdout of the child is the parent’s
stdout (the terminal), not a `[]byte` you print later:

```go
cmd := exec.Command("echo", "hello-via-run")
err := cmd.Run() // start + wait; stdout is the parent's stdout, not a []byte
```

The child’s `echo` prints on the terminal itself. You do not get
`parent received:`.

`Start` + `Wait` is start, do other work, then join. The child runs in
parallel with the parent until `Wait`:

```go
cmd := exec.Command("sleep", "0.1")
err := cmd.Start() // child is alive; this G continues
fmt.Println("parent working while child PID", cmd.Process.Pid, "runs")
err = cmd.Wait()   // join this PID (like WaitGroup.Wait)
```

`Output` is `Run` plus “give me stdout.” All three wait for exit;
only `Start` lets you interleave work before that wait.

### Signals

```go
ch := make(chan os.Signal, 1)
signal.Notify(ch, os.Interrupt)
select {
case s := <-ch:
    fmt.Println("got signal", s)
case <-time.After(d):
    ...
}
```

`Notify` is not a C handler. The runtime turns a process signal into a
**channel send**. Buffer `1` so a signal that arrives before you
`select` is not dropped. `os.Interrupt` is Ctrl+C (`SIGINT` on Unix).

This demo waits **200ms**. You will usually hit the timeout and print
`no signal`. Bump `d` (or run and hit Ctrl+C quickly) to take the other
branch. After a real signal, a long-lived program would `stop()` a
context (lesson 11 / 15), not `os.Exit` in the middle of cleanup.

### Exec and exit (prints only)

`unix.Exec` / `syscall.Exec` would replace this PID. We do not call it:
`go run` would become `echo` (or whatever) and you would lose the rest
of `main`.

`os.Exit(code)` would skip remaining defers and return that status
(lesson 00). `main` returning is the clean path.

## Process vs goroutine

|               | Goroutine (04)      | Child process     |
| ------------- | ------------------- | ----------------- |
| Memory        | same heap as you    | its own           |
| Join          | WaitGroup / channel | `Wait` / `Output` |
| Stop politely | `ctx.Done()`        | signal, then wait |

## What to run

```bash
go run ./docs/16-processes-signals-exit
```

You should see captured stdout from `Output`, then `hello-via-run` from
the child’s own stdout (`Run`), then a parent line while `sleep` is
alive and `child exited` after `Wait`. Then the 200ms signal timeout,
then the two lines about Exec and `os.Exit`.

This is the last numbered folder. Re-read 01 if “process vs goroutine”
still blurs.
