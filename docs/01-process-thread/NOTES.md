# 01 — CPU, process, thread

Read this before any Go code. There is no `main.go` here on purpose.

## 1. A CPU only does one thing at a time (per core)

A CPU core is a machine that:

1. fetches the next instruction from memory
2. executes it
3. repeats

It has a tiny amount of _private_ state while it is executing:

- **program counter (PC / IP):** “which instruction am I on?”
- **registers:** scratch paper for numbers — a handful of very fast
  slots _on the chip_, not RAM. They hold whatever the current
  instruction is chewing on (addends, a pointer, a return value). They
  are temporary workspace: rewritten every few instructions. Long-lived
  data lives in memory. Pause a thread and the OS must save this
  scratch paper and restore it later, or the thread resumes with the
  wrong numbers.
- **stack pointer:** “where is my current function’s local data?”

That bundle of “where I am in the program + my scratch paper” is a
**thread of execution**. That phrase is not Go jargon. It is OS jargon.
It means: a sequence of instructions that can be paused and resumed.

If you have 8 cores, you can be _truly_ executing 8 threads at the same
instant. Everything else is an illusion created by rapidly switching.

## 2. A process is a program plus a private universe of memory

When you run `./myapp` (or `go run ...`), the OS creates a **process**.

A process is:

- an address space (virtual memory: “this program thinks it owns 0x0 … huge”)
- at least one thread
- OS bookkeeping: open files, environment, PID, permissions

**Analogy:** a process is a house. Memory is the rooms. Code and data live
inside. Other houses (other processes) cannot walk into your rooms unless
you use special doors (pipes, sockets, files, shared memory).

That isolation is why a crash in Chrome does not usually wipe your terminal.
Separate address spaces.

## 3. A thread is a worker _inside_ that house

A **thread** (OS thread, kernel thread, pthread — same idea) is:

- its own program counter
- its own registers
- its own stack (function calls, local variables)
- **the same address space as every other thread in that process**

**Analogy:** threads are people in the same house. They share the fridge
(heap, global variables). They do _not_ share their pockets (stack, registers)
except by deliberately handing things over.

So:

| Thing                | Shared between threads of one process? |
| -------------------- | -------------------------------------- |
| Heap, globals, files | yes                                    |
| Stack, registers, PC | no (each thread has its own)           |

This single fact is why concurrency is hard. Two threads can both touch
`counter++` on the same variable. Two processes generally cannot, unless
you set that up on purpose.

## 4. “Concurrent” vs “parallel”

The distinction is about **cores and the same instant**, not about
“process vs thread.”

- **Parallel:** two (or more) things _executing at the same moment_ on
  different cores. Real simultaneity. That can be:
  - two **threads** of one process, each on its own core
  - two **processes** (Chrome + your terminal, or two `go run`s), each
    on its own core
- **Concurrent:** many threads of execution are _in progress_ — the
  work overlaps in time. The usual picture is **one process, many
  threads, taking turns** on a core (the OS pauses one, runs another).
  Same idea across processes: the kernel can time-slice two programs
  on a single core. They are concurrent; they are not parallel.

You can have concurrency without parallelism (one core, lots of switching).
You can have parallelism without a nice concurrent design (two processes
that never talk).

### `GOMAXPROCS` (preview)

Your Go program is **one process**. Inside it you may start thousands
of goroutines. That does not mean thousands of cores.

**`GOMAXPROCS`** is the runtime’s cap on how many goroutines may run
**Go code at the same time** (in parallel). Default is the number of
logical CPUs (`runtime.NumCPU()`). You can set it with the
`GOMAXPROCS` environment variable or `runtime.GOMAXPROCS(n)`.

It does **not** cap how many goroutines you create. Extra goroutines
wait their turn (concurrency without that much parallelism). Lesson 13
covers the full GMP picture (`P` ≈ `GOMAXPROCS`).

Go’s goroutines are a concurrency tool. The runtime _may_ run them in
parallel if `GOMAXPROCS` > 1 and you have multiple cores.

## 5. Blocking is an OS idea

Imagine a thread that is waiting for a request on a socket (a network
connection). The packet has not arrived yet. The thread has two options:

1. **Busy-wait (spin):** keep looping “is it here yet?” The core is
   occupied doing nothing useful. Other work cannot run on that core.
2. **Block:** tell the kernel “wake me when data arrives.” The kernel
   **deschedules** the thread: it is marked asleep and taken off the
   core. The core is free to run some other thread. Later the packet
   arrives, the kernel wakes the sleeper, and it continues from the
   `read` as if no time had passed.

Blocking is the sane default. The thread is not burning CPU while it
waits.

The catch: an **OS thread** is still expensive even when it is asleep.
Each one owns a large stack (often ~1 MiB reserved) plus kernel
bookkeeping. The OS will not happily give you 100,000 of them. A
server that wants “one thread per connection” hits that wall.

**That is the entire motivation for goroutines.** You still want many
concurrent tasks (one per request, one per connection). You do _not_
want one OS thread per task. Go implements those tasks as cheap
user-space threads (goroutines) and runs lots of them on a small pool
of OS threads. How that multiplexing works is later (lessons 02, 04,
13). The only point here: blocking is cheap for the CPU, OS threads
are not cheap as objects.

## 6. Map this onto Go (preview only)

| OS                                      | Go                                                 |
| --------------------------------------- | -------------------------------------------------- |
| Process                                 | your running program (`go run`, a compiled binary) |
| OS thread                               | what the Go runtime actually runs on (`M` in GMP)  |
| Thread of execution (the abstract idea) | a **goroutine**                                    |
| Shared address space                    | all goroutines in one process share the heap       |

A goroutine is **not** an OS thread. It is a _user-space_ thread of
execution that the Go runtime multiplexes onto a smaller pool of OS threads.

You now know enough to understand _why_ that sentence exists. Lesson 02
explains the cost of switching OS threads. Lesson 04 explains how Go
avoids that cost.

Next: `02-scheduling/NOTES.md`
