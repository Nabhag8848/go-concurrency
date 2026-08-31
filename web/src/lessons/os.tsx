import { BlockVsSpin } from "../visuals/BlockVsSpin"
import { ConcurrentVsParallel } from "../visuals/ConcurrentVsParallel"
import { ContextSwitch } from "../visuals/ContextSwitch"
import { CoreFetch } from "../visuals/CoreFetch"
import { ProcessHouses } from "../visuals/ProcessHouses"
import { SchedulerStates } from "../visuals/SchedulerStates"
import { ThreadsInHouse } from "../visuals/ThreadsInHouse"
import { UserSpaceMux } from "../visuals/UserSpaceMux"
import { C, Li, NoteTable, P, Ul } from "./prose"
import type { Lesson } from "./types"

export const osLessons: Lesson[] = [
  {
    slug: "01-process-thread",
    order: 1,
    title: "CPU, process, thread",
    deck: "No program on the right — pictures of the machine instead.",
    segments: [
      {
        note: (
          <>
            <P>
              A CPU core fetches an instruction, executes it, repeats. While it
              works it keeps a tiny private bundle: program counter, registers
              (scratch on the chip, not RAM), and a stack pointer. That bundle
              is a <strong>thread of execution</strong> — OS jargon for a
              sequence of instructions that can pause and resume.
            </P>
            <P>
              Eight cores can truly execute eight threads at the same instant.
              Everything else is rapid switching.
            </P>
          </>
        ),
        visual: <CoreFetch />,
      },
      {
        note: (
          <>
            <P>
              Run a binary and the OS creates a <strong>process</strong>: an
              address space, at least one thread, files, PID, permissions. A
              process is a house. Other houses cannot walk into your rooms
              unless you open a door (pipe, socket, file). That isolation is
              why a crash in one program does not usually wipe another.
            </P>
          </>
        ),
        visual: <ProcessHouses />,
      },
      {
        note: (
          <>
            <P>
              A <strong>thread</strong> is a worker inside that house: own
              program counter, registers, and stack. Heap, globals, and files
              are shared with sibling threads. Two threads can both touch{" "}
              <C>counter++</C>. Two processes generally cannot.
            </P>
            <NoteTable
              headers={["Thing", "Shared in one process?"]}
              rows={[
                ["Heap, globals, files", "yes"],
                ["Stack, registers, PC", "no"],
              ]}
            />
          </>
        ),
        visual: <ThreadsInHouse />,
      },
      {
        note: (
          <>
            <P>
              <strong>Parallel</strong> means two things executing at the same
              moment on different cores. <strong>Concurrent</strong> means work
              overlaps in time — often one core, many threads taking turns. You
              can have concurrency without parallelism.
            </P>
            <P>
              Your Go program is one process.{" "}
              <C>GOMAXPROCS</C> caps how many goroutines may run Go code at the
              same time. It does not cap how many you create.               Extra work waits
              its turn.
            </P>
          </>
        ),
        visual: <ConcurrentVsParallel />,
      },
      {
        note: (
          <>
            <P>
              When a thread waits on a socket, spinning wastes the core.{" "}
              <strong>Blocking</strong> tells the kernel to deschedule it:
              asleep, core free, woken when data arrives. Blocking is cheap for
              the CPU. An OS thread is still expensive as an object (~1 MiB
              stack, kernel bookkeeping). You cannot sanely have 100,000 of
              them. That is the entire motivation for goroutines: many concurrent
              tasks, few OS threads.
            </P>
            <NoteTable
              headers={["OS", "Go"]}
              rows={[
                ["Process", "the running program"],
                ["OS thread", "what the runtime actually runs on (M)"],
                ["Thread of execution", "a goroutine"],
                ["Shared address space", "one heap for every goroutine"],
              ]}
            />
          </>
        ),
        visual: <BlockVsSpin />,
      },
    ],
  },
  {
    slug: "02-scheduling",
    order: 2,
    title: "Scheduling and context switching",
    deck: "Why “one OS thread per task” dies, and what user-space scheduling buys you.",
    segments: [
      {
        note: (
          <>
            <P>
              There are more threads than cores. The kernel scheduler picks who
              gets a core. A thread is running, runnable, or blocked. Only
              running uses a core. Everyone else is parked.
            </P>
          </>
        ),
        visual: <SchedulerStates />,
      },
      {
        note: (
          <>
            <P>
              A <strong>context switch</strong> saves A’s registers and program
              counter, loads B’s, starts B. It is not free: extra save/restore,
              a trip through the kernel, and a cold cache and TLB. OS threads
              are scheduled preemptively. After a time slice the kernel can
              interrupt you mid-loop. It also switches when you block.               You do
              not pick the moment.
            </P>
          </>
        ),
        visual: <ContextSwitch />,
      },
      {
        note: (
          <>
            <P>
              100,000 OS threads means 100,000 fat stacks and a scheduler that
              thrashes. Servers want that many connections anyway. Historical
              answer: event loops. Go’s answer: many user-space goroutines, few
              OS threads.
            </P>
            <P>
              The kernel scheduler sees OS threads and does not know about
              goroutines. The Go scheduler parks a goroutine waiting on a
              channel and runs another on the <em>same</em> OS thread — often
              without a kernel context switch. A blocking syscall can pin an M
              in the kernel; the runtime may hand the P to another M so other
              work keeps going.
            </P>
            <Ul>
              <Li>A core is scarce.</Li>
              <Li>An OS thread is an expensive way to say “more work in flight.”</Li>
              <Li>Blocking an OS thread parks a whole expensive worker.</Li>
              <Li>Go represents work as cheap goroutines and only pins OS threads for running code or syscalls.</Li>
            </Ul>
          </>
        ),
        visual: <UserSpaceMux />,
      },
    ],
  },
]
