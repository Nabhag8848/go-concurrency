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
    deck: "Two threads of execution, one whiteboard, no handshake.",
    segments: [
      {
        note: (
          <P>
            Two workers, one house, one integer. A race condition means the
            result depends on who runs when. The scheduler may interleave
            instructions you did not imagine.
          </P>
        ),
        code: sliceLines(races, 1, 11),
      },
      {
        note: (
          <>
            <P>
              <C>counter++</C> looks like one step. On the CPU it is often load,
              add, store. Both workers can load <C>0</C>, both add, both store{" "}
              <C>1</C>. You lost an update. That is a data race when they
              unsynchronized-share a variable.
            </P>
            <P>
              Visibility is separate: a core can store into its own cache and
              keep going. Another core may still load the old value. Compilers
              and CPUs also reorder. A happens-before edge is the handshake that
              makes a write visible — mutex unlock then lock, atomic store then
              load, channel send then receive. Without that, the program is
              undefined. <C>go run -race</C> is the scream.
            </P>
          </>
        ),
        code: sliceLines(races, 12, 21),
      },
      {
        note: (
          <P>
            Sleep is a guess so the race has time to happen before the print.
            The number is often less than 100,000. The fix is not in this
            program. First you must see the bug.
          </P>
        ),
        code: sliceLines(races, 23, 30),
      },
    ],
  },
  {
    slug: "00-defer-panic-recover",
    order: 4,
    title: "Defer, panic, recover, exit",
    deck: "Stack and process tools — not concurrency primitives. Later lessons still need them.",
    segments: [
      {
        note: (
          <P>
            <C>defer</C> registers a call for when the enclosing function
            returns — cleanup, unlock, done. Body runs first. Deferred calls run
            last-in, first-out. They still run if the function panics, which is
            why recover lives in a defer.
          </P>
        ),
        code: sliceLines(deferPanic, 1, 12),
      },
      {
        note: (
          <>
            <P>
              Panic means something unexpected went wrong. It unwinds{" "}
              <em>this</em> goroutine’s stack. If nobody recovers, the whole
              process dies — every other goroutine gone.
            </P>
            <P>
              <C>recover</C> only works inside a deferred function. Here the
              rest of the function is skipped, recover returns the panic value,
              and control returns to the caller. A server should not die because
              one request panics: recover at the edge, drop the request, keep
              serving.
            </P>
          </>
        ),
        code: sliceLines(deferPanic, 14, 22),
      },
      {
        note: (
          <P>
            <C>os.Exit</C> dies now. Defers do not run. Returning from{" "}
            <C>main</C> does run defers, with status 0. The Exit calls stay
            commented so you can see the last defer. Go does not use <C>main</C>
            ’s return value as the exit status.
          </P>
        ),
        code: sliceLines(deferPanic, 24, 42),
      },
    ],
  },
  {
    slug: "16-processes-signals-exit",
    order: 5,
    title: "Signals, spawn, exec, exit",
    deck: "Doors to other houses — not more people in this one.",
    segments: [
      {
        note: (
          <>
            <P>
              Channels and mutexes live inside one process. Spawn is a new PID
              and separate memory. Exec overlays this PID with another binary —
              the Go runtime is gone. Signals interrupt the process, not each
              goroutine. You listen on one goroutine, then cancel the rest.
            </P>
            <P>
              <C>Output</C> starts a child, waits until it exits, and captures
              stdout. That wait is a join for a PID.
            </P>
          </>
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
          <>
            <P>
              <C>signal.Notify</C> turns a process signal into a channel send.
              Buffer 1 so a signal before you select is not dropped. This demo
              usually hits the timeout. After a real interrupt, cancel a context
              — do not Exit in the middle of cleanup.
            </P>
            <P>
              We do not call Exec or Exit here so the rest of the program can
              finish.
            </P>
          </>
        ),
        code: sliceLines(processes, 49, 78),
      },
    ],
  },
  {
    slug: "04-goroutines",
    order: 6,
    title: "Goroutines",
    deck: "A thread of execution implemented by the runtime, not the kernel.",
    segments: [
      {
        note: (
          <P>
            An OS thread is an expensive kernel-scheduled worker with a fat
            stack. A goroutine starts around a couple of KiB and grows. You can
            have hundreds of thousands of them. You cannot sanely have that many
            OS threads.
          </P>
        ),
        code: sliceLines(goroutines, 1, 13),
      },
      {
        note: (
          <>
            <P>
              <C>go f(x)</C> creates a new goroutine that will call <C>f(x)</C>.
              The caller does not wait. When <C>main</C> returns, the process
              exits even if others are still running.
            </P>
            <P>
              Go schedules M:N — G is the work, M is an OS thread, P is a right
              to execute Go code. When a goroutine waits on a channel, the
              runtime parks it and runs another on the same OS thread. No kernel
              context switch required.
            </P>
          </>
        ),
        code: sliceLines(goroutines, 15, 27),
      },
      {
        note: (
          <P>
            Prints interleave. Order is not guaranteed. That is the scheduler.
            If you <C>go</C> something, you have concurrent access to whatever
            that function touches. Either don’t share, or synchronize.
          </P>
        ),
        code: sliceLines(goroutines, 29, 32),
      },
    ],
  },
  {
    slug: "05-waitgroups",
    order: 7,
    title: "WaitGroups",
    deck: "Join without guessing. Sleep is not a join.",
    segments: [
      {
        note: (
          <>
            <P>
              The kernel can join OS threads. A goroutine is not a kernel
              object. <C>WaitGroup</C> is the user-space join: a counter plus a
              sleep queue. <C>Add</C> before launch, <C>Done</C> once per add,{" "}
              <C>Wait</C> parks until the count is zero.
            </P>
            <P>
              Prefer <C>defer Done()</C> so a return or panic still accounts for
              the worker.
            </P>
          </>
        ),
        code: sliceLines(waitgroups, 1, 12),
      },
      {
        note: (
          <>
            <P>
              Add before <C>go</C>, or Wait can see zero too early. Pass a
              pointer; do not copy a WaitGroup after use. Wait parks the
              goroutine, not necessarily the OS thread forever — the runtime can
              run other work on that thread.
            </P>
            <P>
              Joining is not protecting shared data. This only answers “are they
              finished?”
            </P>
          </>
        ),
        code: sliceLines(waitgroups, 14, 25),
      },
    ],
  },
  {
    slug: "06-mutexes",
    order: 8,
    title: "Mutexes",
    deck: "Same loop as the race, plus a door on the whiteboard.",
    segments: [
      {
        note: (
          <>
            <P>
              A mutex is mutual exclusion on a piece of memory. Uncontended lock
              is a cheap CPU instruction. If someone already holds it, this
              goroutine parks. The code between lock and unlock is the critical
              section — keep it tiny.
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
              One goroutine at a time does the load/add/store. Unlock is also
              the handshake: the next locker is guaranteed to see those writes.
              The lock makes the whiteboard update visible, not the <C>++</C>{" "}
              itself.
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
    order: 9,
    title: "Atomic counters",
    deck: "A mutex serializes a region of code. An atomic is one word on the chip.",
    segments: [
      {
        note: (
          <P>
            <C>Add</C> is safe from many goroutines without a lock. It is the
            wrong tool when several fields must change together — two atomics
            are two steps, and another goroutine can see a frankenstein value.
            One integer or flag: atomic is fine. A struct that must stay
            consistent: mutex, or one owner goroutine later.
          </P>
        ),
        code: sliceLines(atomics, 1, 25),
      },
    ],
  },
];
