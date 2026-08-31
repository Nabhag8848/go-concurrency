import channels from "../../../docs/08-channels/main.go?raw";
import selectTimeouts from "../../../docs/09-select-timeouts/main.go?raw";
import workerPools from "../../../docs/10-worker-pools/main.go?raw";
import contextLesson from "../../../docs/11-context/main.go?raw";
import deadlocks from "../../../docs/12-deadlocks-leaks/main.go?raw";
import gmp from "../../../docs/13-gmp-runtime/main.go?raw";
import rateLimiting from "../../../docs/14-rate-limiting/main.go?raw";
import stateful from "../../../docs/15-stateful-goroutines/main.go?raw";

import { sliceLines } from "./lines";
import { C, NoteTable, P } from "./prose";
import type { Lesson } from "./types";

export const channelLessons: Lesson[] = [
  {
    slug: "08-channels",
    order: 8,
    title: "Channels",
    deck: "Coordinate goroutines by sending values through channels.",
    osConnection: "A Unix pipe moves bytes between processes without sharing memory. A Go channel uses the same handoff idea inside one process and provides the required memory-ordering handshake.",
    source: channels,
    segments: [
      {
        note: (
          <P>
            A channel sends typed values between goroutines. A send and receive
            form a synchronization point, so the receiver sees earlier writes.
            An unbuffered send waits for its receiver.
          </P>
        ),
        code: sliceLines(channels, 1, 22),
      },
      {
        note: (
          <P>
            A buffered channel is a bounded queue. Send blocks only when it is
            full. Its capacity provides backpressure.
          </P>
        ),
        code: sliceLines(channels, 24, 32),
      },
      {
        note: (
          <P>
            Closing says no more values will be sent. Range receives remaining
            values, then stops. Only the sender should close a channel.
          </P>
        ),
        code: sliceLines(channels, 34, 46),
      },
    ],
  },
  {
    slug: "09-select-timeouts",
    order: 9,
    title: "Select and timeouts",
    deck: "Wait on multiple channel operations and limit how long they can block.",
    osConnection: "Unix select and poll wait for one of several file descriptors or a timeout. Go’s select has the same shape for channels and parks the goroutine instead of spinning.",
    source: selectTimeouts,
    segments: [
      {
        note: (
          <P>
            Each <C>select</C> case is a channel operation. It waits until one
            case is ready; if several are ready, Go chooses one. A timer case
            limits the wait, but does not stop the worker.
          </P>
        ),
        code: sliceLines(selectTimeouts, 1, 21),
      },
      {
        note: (
          <P>
            Same shape, faster worker. Select waits for whichever case is ready
            first.
          </P>
        ),
        code: sliceLines(selectTimeouts, 23, 34),
      },
      {
        note: (
          <P>
            <C>default</C> means try now and do not wait. That is not a timeout.
            Asking other goroutines to stop is context.
          </P>
        ),
        code: sliceLines(selectTimeouts, 36, 43),
      },
      {
        note: (
          <P>
            A ticker repeats until Stop. Stop does not close the channel, so
            this loop also waits on done. Stop tickers you no longer need.
          </P>
        ),
        code: sliceLines(selectTimeouts, 45, 62),
      },
    ],
  },
  {
    slug: "10-worker-pools",
    order: 10,
    title: "Worker pools",
    deck: "Process jobs with a fixed number of concurrent workers.",
    osConnection: "OS threads, CPU time, sockets, and file descriptors are finite resources. A pool bounds concurrent work before it overwhelms one of them.",
    source: workerPools,
    segments: [
      {
        note: (
          <P>
            Goroutines are cheap, but unbounded work can exhaust downstream
            resources. A worker pool caps concurrent jobs. Workers receive jobs
            until the jobs channel is closed and empty.
          </P>
        ),
        code: sliceLines(workerPools, 1, 18),
      },
      {
        note: (
          <P>
            Three workers process five jobs, so only three jobs run at once.
            Closing jobs tells workers that no more work is coming. Wait for
            workers before closing results for the receiver.
          </P>
        ),
        code: sliceLines(workerPools, 20, 45),
      },
    ],
  },
  {
    slug: "14-rate-limiting",
    order: 14,
    title: "Rate limiting",
    deck: "Control how frequently work is allowed to start.",
    osConnection: "The kernel will not stop one process from starting requests too quickly. A runtime timer turns the system clock into a gate that parks work until the next token arrives.",
    source: rateLimiting,
    segments: [
      {
        note: (
          <P>
            A ticker releases one token per interval. Receiving that token is
            the gate for each request. Stop a ticker when it is no longer used.
          </P>
        ),
        code: sliceLines(rateLimiting, 1, 22),
      },
      {
        note: (
          <P>
            A burst keeps several tokens ready in a buffered channel. Requests
            can spend those tokens immediately. Later requests wait for refill.
          </P>
        ),
        code: sliceLines(rateLimiting, 24, 46),
      },
    ],
  },
  {
    slug: "15-stateful-goroutines",
    order: 15,
    title: "Stateful goroutines",
    deck: "Keep mutable state in one goroutine and access it through messages.",
    osConnection: "Shared state across cores needs locks or atomics to stay correct. One owner goroutine avoids that coordination by making every other goroutine send a request instead.",
    source: stateful,
    segments: [
      {
        note: (
          <P>
            Each request carries a private reply channel. One goroutine owns
            the map and performs every operation. Clients wait for its reply, so
            no mutex is needed for the map.
          </P>
        ),
        code: sliceLines(stateful, 1, 18),
      },
      {
        note: (
          <P>
            The owner selects among read requests, write requests, and
            cancellation. Unbuffered operations make clients wait until it takes
            their request. This design has no shared map access to race on.
          </P>
        ),
        code: sliceLines(stateful, 20, 44),
      },
      {
        note: (
          <P>
            Clients finish their work, then request one final read and stop the
            owner. Cancellation is cooperative, so the owner must return. Join
            it instead of sleeping and hoping.
          </P>
        ),
        code: sliceLines(stateful, 46, 65),
      },
    ],
  },
  {
    slug: "11-context",
    order: 11,
    title: "Context",
    deck: "Pass cancellation signals, deadlines, and request-scoped values through concurrent work.",
    osConnection: "Unix can force-kill a process, but Go cannot safely kill one goroutine while it may hold a lock or write data. Context makes cancellation cooperative: the goroutine observes Done and returns.",
    source: contextLesson,
    segments: [
      {
        note: (
          <P>
            <C>Done()</C> is closed when a context is canceled or reaches its
            deadline. Parent cancellation reaches child contexts. Always call
            the cancel function to release its timer.
          </P>
        ),
        code: sliceLines(contextLesson, 1, 25),
      },
      {
        note: (
          <P>
            Cancellation does not stop a function from the outside; its loop
            must observe <C>Done()</C> and return. <C>Wait</C> verifies that the
            child did so instead of leaking.
          </P>
        ),
        code: sliceLines(contextLesson, 27, 44),
      },
    ],
  },
  {
    slug: "12-deadlocks-leaks",
    order: 12,
    title: "Deadlocks and leaks",
    deck: "Recognize blocked programs and goroutines that never finish.",
    osConnection: "The kernel and Go runtime can park waiters, but neither can break a cycle where every wakeup depends on another blocked waiter. A leak is one parked goroutine that the rest of the program leaves behind.",
    source: deadlocks,
    segments: [
      {
        note: (
          <P>
            An unbuffered send needs a receiver at the same time. Here the
            receiver is the next line, so it never starts. The runtime reports a
            deadlock when every goroutine is blocked.
          </P>
        ),
        code: sliceLines(deadlocks, 1, 16),
      },
      {
        note: (
          <P>
            A goroutine leak leaves work blocked while the program continues.
            A buffered result and nonblocking send let this worker finish after
            timeout. <C>Wait</C> confirms that it did.
          </P>
        ),
        code: sliceLines(deadlocks, 18, 50),
      },
    ],
  },
  {
    slug: "13-gmp-runtime",
    order: 13,
    title: "The Go runtime",
    deck: "See how the Go runtime schedules goroutines onto operating-system threads.",
    osConnection: "The kernel schedules OS threads and has no knowledge of goroutines. Go’s scheduler chooses which goroutine runs on each thread and moves on when one parks.",
    source: gmp,
    segments: [
      {
        note: (
          <P>
            Running Go code requires a goroutine (G), OS thread (M), and
            processor token (P). When a goroutine parks, the thread can run
            another one with the same P.
          </P>
        ),
        code: sliceLines(gmp, 1, 13),
      },
      {
        note: (
          <>
            <P>
              Eight sleeping goroutines do not require eight OS threads.
              <C>GOMAXPROCS</C> caps how much Go code runs in parallel. It does
              not limit the number of goroutines you create.
            </P>
            <NoteTable
              headers={["You write", "Runtime does"]}
              rows={[
                [<C key="a">go f()</C>, "allocate G, put on a run queue"],
                [
                  <C key="b">ch send / receive</C>,
                  "park G, maybe wake the other side",
                ],
                [<C key="c">Lock / Wait / select</C>, "park G until a wakeup"],
              ]}
            />
          </>
        ),
        code: sliceLines(gmp, 15, 28),
      },
    ],
  },
];
