import { BlockVsSpin } from "../visuals/BlockVsSpin"
import { ConcurrentVsParallel } from "../visuals/ConcurrentVsParallel"
import { ContextSwitch } from "../visuals/ContextSwitch"
import { CoreFetch } from "../visuals/CoreFetch"
import { ProcessHouses } from "../visuals/ProcessHouses"
import { SchedulerStates } from "../visuals/SchedulerStates"
import { ThreadsInHouse } from "../visuals/ThreadsInHouse"
import { UserSpaceMux } from "../visuals/UserSpaceMux"
import { Li, NoteTable, P, Ul } from "./prose"
import type { Lesson } from "./types"

export const osLessons: Lesson[] = [
  {
    slug: "01-process-thread",
    order: 1,
    title: "CPU, process, thread",
    deck: "Understand the roles of CPUs, processes, and threads.",
    osConnection: "The operating system creates processes with private memory and schedules their threads on CPU cores. A thread’s registers and stack are the state the OS saves to pause and resume it.",
    segments: [
      {
        note: (
          <P>
            A CPU core fetches and executes instructions. A thread of execution
            carries the registers and stack needed to pause and resume that
            work. More threads than cores means rapid switching.
          </P>
        ),
        visual: <CoreFetch />,
      },
      {
        note: (
          <P>
            Running a binary creates a process with its own memory, files, and
            permissions. Processes are isolated from each other by default. A
            crash in one process usually does not affect another.
          </P>
        ),
        visual: <ProcessHouses />,
      },
      {
        note: (
          <>
            <P>
              A thread has its own registers and stack. Threads in one process
              share its heap, globals, and files. That shared memory needs
              coordination.
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
          <P>
            Parallel work runs at the same instant on different cores.
            Concurrent work overlaps in time, often by taking turns. You can
            have concurrency without parallelism.
          </P>
        ),
        visual: <ConcurrentVsParallel />,
      },
      {
        note: (
          <>
            <P>
              Blocking lets the kernel free a core while a thread waits for I/O.
              An OS thread is still expensive to create and manage. Goroutines
              allow many waiting tasks to share fewer OS threads.
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
    deck: "Learn how operating systems schedule work and switch between tasks.",
    osConnection: "The kernel chooses which runnable thread gets a core and can preempt it after a time slice. That switch saves CPU state and costs cache locality.",
    segments: [
      {
        note: (
          <P>
            There are usually more threads than CPU cores. The kernel scheduler
            chooses which runnable thread gets a core. Blocked threads wait
            without using one.
          </P>
        ),
        visual: <SchedulerStates />,
      },
      {
        note: (
          <P>
            A context switch saves one thread’s CPU state and restores another’s.
            It costs time and can disturb CPU caches. The kernel may switch
            threads after a time slice or when one blocks.
          </P>
        ),
        visual: <ContextSwitch />,
      },
      {
        note: (
          <>
            <P>
              Servers can have many more connections than practical OS threads.
              Go represents that work as lightweight goroutines. The runtime can
              park one goroutine and run another on the same OS thread.
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
