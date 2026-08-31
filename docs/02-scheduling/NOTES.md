# 02 — Scheduling and context switching

## 1. There are more threads than cores

The OS has a **scheduler**. Its job: pick which runnable thread gets a core
next.

A thread is in one of a few states (simplified):

- **Running** — on a core right now
- **Runnable** — wants a core, waiting in a queue
- **Blocked** — sleeping (I/O, lock, timer, `Wait`)

Only “running” uses a core. Everyone else is parked.

## 2. Context switch

To take thread A off a core and put thread B on:

1. save A’s registers + program counter (into A’s kernel thread struct)
2. load B’s registers + program counter
3. start executing B

That is a **context switch**. It is not free:

- **Save/restore registers.** The core’s scratch paper belonged to A.
  Before B can run, every register and the program counter must be
  written out (A) and loaded in (B). That is extra work that is not
  your program.
- **Trip through the kernel.** Your code runs in _user mode_ (unprivileged).
  Only the kernel can pick the next thread. Switching means: enter
  kernel mode, do the bookkeeping, return to user mode as B. Crossing
  that boundary is slower than staying in user code.
- **Cache and TLB go cold.** The CPU keeps a tiny, very fast copy of
  recently used memory (the **cache**) and a map of “virtual address →
  physical page” (the **TLB**). Those were tuned for A. B lives in
  different memory. The next instructions miss, fetch from RAM, and
  refill. A was “hot”; B starts “cold.”

OS threads are scheduled **preemptively**. The kernel does not wait for
you to return from a function. After a **time slice** (often a few
milliseconds) it can interrupt A mid-loop, context-switch to B, and
later resume A on the exact instruction it left. It also switches when
A **blocks** (I/O, sleep, lock). You do not control the moment; the
kernel does.

## 3. Why “just spawn a thread per task” dies

If you create 100,000 OS threads:

- ~100,000 stacks (megabytes each on many OSes → tens of GB)
- 100,000 kernel objects
- the scheduler thrashes: more time switching than working

Servers want 100,000 concurrent connections. They cannot want 100,000
kernel threads. Historical answer: event loops (Node, nginx) — one or few
threads, non-blocking I/O, you write the state machine. Go’s answer:
**many user-space goroutines, few OS threads.**

## 4. User-space scheduling vs kernel scheduling

- **Kernel scheduler** sees OS threads. It does not know about goroutines.
- **Go scheduler** (user-space) sees goroutines. It parks a goroutine that
  is waiting on a channel, and runs another goroutine on the _same_ OS thread
  — often without asking the kernel to context-switch.

When a goroutine makes a blocking syscall, Go may attach a new OS thread
so other goroutines keep running. That is why syscalls are a special case
(lesson 13).

## 5. What you should feel in your bones

1. A core is a scarce resource.
2. An OS thread is an expensive way to represent “I have more work in flight.”
3. Blocking an OS thread parks a whole expensive worker.
4. Go’s trick is to represent work as cheap goroutines and only pin OS
   threads for work that is actually running or in a syscall.

Next: `03-shared-memory-races` — the bug that appears the moment two
threads of execution share memory.
