import deferPanic from "../../../docs/00-defer-panic-recover/main.go?raw";
import races from "../../../docs/03-shared-memory-races/main.go?raw";
import goroutines from "../../../docs/04-goroutines/main.go?raw";
import waitgroups from "../../../docs/05-waitgroups/main.go?raw";
import mutexes from "../../../docs/06-mutexes/main.go?raw";
import atomics from "../../../docs/07-atomics/main.go?raw";
import processes from "../../../docs/16-processes-signals-exit/main.go?raw";

import { sliceLines } from "./lines";
import { C, Li, NoteTable, P, Ul } from "./prose";
import type { Lesson } from "./types";

export const memoryLessons: Lesson[] = [
  {
    slug: "03-shared-memory-races",
    order: 3,
    title: "Shared memory and races",
    deck: "See how unsafe shared memory access creates data races.",
    osConnection: "Two cores can interleave the load, add, and store in x++. They may also see different cached values until a synchronization primitive creates a happens-before edge.",
    source: races,
    segments: [
      {
        note: (
          <P>
            Two goroutines update the same integer without coordination. The
            result depends on their timing. That is a race condition.
          </P>
        ),
        code: sliceLines(races, 1, 11),
      },
      {
        note: (
          <P>
            <C>counter++</C> is a load, add, and store—not one indivisible
            operation. Both goroutines can read the same value and overwrite
            each other’s result. Run <C>go run -race</C> to detect it.
          </P>
        ),
        code: sliceLines(races, 12, 21),
      },
      {
        note: (
          <P>
            Sleep only gives the race time to happen before printing. The count
            is often less than 100,000. First, see the bug; the next lessons fix
            it.
          </P>
        ),
        code: sliceLines(races, 23, 30),
      },
    ],
  },
  {
    slug: "00-defer-panic-recover",
    order: 0,
    title: "Defer, panic, recover, exit",
    deck: "Use defer, panic, recover, and exit to control cleanup and failure.",
    osConnection: "Returning or panicking unwinds Go stacks, so defers can run. os.Exit hands control back to the OS immediately, without unwinding those stacks.",
    source: deferPanic,
    segments: [
      {
        note: (
          <P>
            <C>defer</C> schedules cleanup for when its function returns.
            Deferred calls run last-in, first-out. They also run during a panic.
          </P>
        ),
        code: sliceLines(deferPanic, 1, 12),
      },
      {
        note: (
          <P>
            A panic unwinds the current goroutine’s stack. <C>recover</C> works
            only inside a deferred function and returns the panic value. Without
            recovery, the process exits.
          </P>
        ),
        code: sliceLines(deferPanic, 14, 22),
      },
      {
        note: (
          <P>
            <C>os.Exit</C> ends the process immediately, so defers do not run.
            Returning from <C>main</C> does run defers. The commented exit call
            lets this example finish normally.
          </P>
        ),
        code: sliceLines(deferPanic, 24, 42),
      },
    ],
  },
  {
    slug: "16-processes-signals-exit",
    order: 16,
    title: "Signals, spawn, exec, exit",
    deck: "Start programs, handle signals, and understand process termination.",
    osConnection: "A child process has its own PID and memory, while exec replaces the current process image. The kernel delivers signals to the process, not to individual goroutines.",
    source: processes,
    segments: [
      {
        note: (
          <P>
            A child process has its own PID and memory. <C>Output</C> starts it,
            waits for it to exit, and captures its standard output. That wait is
            the process equivalent of a join.
          </P>
        ),
        code: sliceLines(processes, 1, 20),
      },
      {
        note: (
          <P>
            <C>Run</C> waits without capturing. The child’s stdout is the
            parent’s terminal. <C>Start</C> then <C>Wait</C> lets this goroutine
            keep working until it joins the PID.
          </P>
        ),
        code: sliceLines(processes, 22, 47),
      },
      {
        note: (
          <P>
            <C>signal.Notify</C> delivers process signals through a channel.
            Buffer one signal so an early interrupt is not lost. On interrupt,
            cancel ongoing work instead of exiting during cleanup.
          </P>
        ),
        code: sliceLines(processes, 49, 78),
      },
    ],
  },
  {
    slug: "04-goroutines",
    order: 4,
    title: "Goroutines",
    deck: "Run lightweight concurrent functions managed by the Go runtime.",
    osConnection: "An OS thread is a costly, kernel-scheduled worker. The Go runtime schedules many lightweight goroutines onto a smaller set of those threads.",
    source: goroutines,
    segments: [
      {
        note: (
          <P>
            An OS thread is a kernel-scheduled worker with a large fixed cost.
            A goroutine starts with a small, growing stack. You can create far
            more goroutines than OS threads.
          </P>
        ),
        code: sliceLines(goroutines, 1, 13),
      },
      {
        note: (
          <P>
            <C>go f(x)</C> starts <C>f(x)</C> in a new goroutine, and the caller
            continues immediately. When <C>main</C> returns, the process exits.
            Use synchronization when work must finish first.
          </P>
        ),
        code: sliceLines(goroutines, 15, 27),
      },
      {
        note: (
          <P>
            Prints can interleave, so their order is not guaranteed. A goroutine
            has concurrent access to whatever it touches. Avoid sharing data or
            synchronize access to it.
          </P>
        ),
        code: sliceLines(goroutines, 29, 32),
      },
    ],
  },
  {
    slug: "05-waitgroups",
    order: 5,
    title: "WaitGroups",
    deck: "Wait for a group of goroutines to finish safely.",
    osConnection: "The kernel can join OS threads because it knows about them. WaitGroup recreates that join in user space by parking a goroutine until the count reaches zero.",
    source: waitgroups,
    segments: [
      {
        note: (
          <P>
            A <C>WaitGroup</C> waits for a set of goroutines to finish. Call
            <C>Add</C> before launch, then <C>Done</C> once for each worker.
            <C>Wait</C> blocks until the count reaches zero.
          </P>
        ),
        code: sliceLines(waitgroups, 1, 12),
      },
      {
        note: (
          <P>
            Add work before calling <C>go</C>, or <C>Wait</C> may return too
            early. Pass a pointer and never copy a used WaitGroup. It joins work;
            it does not protect shared data.
          </P>
        ),
        code: sliceLines(waitgroups, 14, 25),
      },
    ],
  },
  {
    slug: "06-mutexes",
    order: 6,
    title: "Mutexes",
    deck: "Protect shared data by allowing one goroutine into a critical section at a time.",
    osConnection: "A contended OS-thread lock would park the whole thread in a kernel wait queue. Go’s mutex can park only the waiting goroutine and let the OS thread run other work.",
    source: mutexes,
    segments: [
      {
        note: (
          <>
            <P>
              A mutex gives one goroutine exclusive access to shared memory. A
              waiting goroutine parks until the lock is free. Keep the critical
              section between lock and unlock small.
            </P>
            <NoteTable
              headers={["Question", "Tool"]}
              rows={[
                ["Are the workers finished?", "WaitGroup"],
                ["May they share this variable?", "Mutex"],
              ]}
            />
          </>
        ),
        code: sliceLines(mutexes, 1, 13),
      },
      {
        note: (
          <>
            <P>
              The mutex makes the load, add, and store happen one at a time.
              Unlocking also makes those writes visible to the next locker. Use
              the same mutex for every access to the same data.
            </P>
            <Ul>
              <Li>Same mutex for the same data.</Li>
              <Li>Unlock once per lock.</Li>
              <Li>Do not copy a mutex after use.</Li>
              <Li>Do not hold a lock across slow I/O.</Li>
            </Ul>
          </>
        ),
        code: sliceLines(mutexes, 15, 30),
      },
    ],
  },
  {
    slug: "07-atomics",
    order: 7,
    title: "Atomic counters",
    deck: "Update individual shared values safely without a mutex.",
    osConnection: "An atomic operation is a CPU instruction that safely changes one machine word across cores. It cannot make several fields update as one consistent unit.",
    source: atomics,
    segments: [
      {
        note: (
          <P>
            <C>Add</C> safely updates one value from many goroutines without a
            lock. It cannot make several fields change as one operation. Use a
            mutex or one owner goroutine when data must stay consistent.
          </P>
        ),
        code: sliceLines(atomics, 1, 25),
      },
    ],
  },
];
