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
    order: 10,
    title: "Channels",
    deck: "Do not share the whiteboard. Pass a note.",
    segments: [
      {
        note: (
          <>
            <P>
              A Unix pipe moves bytes between processes without walking into the
              other address space. A channel is that pipe inside one process,
              with a type. Send and receive are a handshake: the receiver sees
              everything the sender did before the send.
            </P>
            <P>
              Unbuffered means no mailbox. Send waits until a receive is
              happening. Directions on the parameters are a seatbelt: ping may
              only send.
            </P>
          </>
        ),
        code: sliceLines(channels, 1, 22),
      },
      {
        note: (
          <P>
            Buffered is a bounded queue. Send parks only when the mailbox is
            full. Uncomment the third send and this goroutine waits for itself —
            deadlock. The bound is backpressure.
          </P>
        ),
        code: sliceLines(channels, 24, 32),
      },
      {
        note: (
          <P>
            Close means no more sends. Range drains remaining values, then
            stops. Only the sender closes. Close twice or send on a closed
            channel panics.
          </P>
        ),
        code: sliceLines(channels, 34, 46),
      },
    ],
  },
  {
    slug: "09-select-timeouts",
    order: 11,
    title: "Select and timeouts",
    deck: "Wait on several things at once, the way poll waits on file descriptors.",
    segments: [
      {
        note: (
          <>
            <P>
              Each case is one channel op. The goroutine parks until one case
              can run. Several ready: Go picks one at random. None ready: park,
              unless you add <C>default</C>.
            </P>
            <P>
              A timeout is wait <em>up to</em> a duration. The timer wins here.
              Select did not kill the worker. Buffer 1 lets that send complete
              after we moved on.
            </P>
          </>
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
    order: 12,
    title: "Worker pools",
    deck: "At most N pieces of work at once, plus a channel as the queue.",
    segments: [
      {
        note: (
          <P>
            Goroutines are cheap, but unbounded fan-out still melts sockets and
            databases. A pool caps how many jobs run at once. Workers range
            until the job channel is closed and empty. Directions keep them from
            sending jobs or receiving results the wrong way.
          </P>
        ),
        code: sliceLines(workerPools, 1, 18),
      },
      {
        note: (
          <P>
            Three workers, five jobs. Buffer to the job count so the producer
            can enqueue without waiting. Close jobs means no more work. Wait
            then close results in another goroutine so ranging outputs cannot
            deadlock if the result channel were unbuffered. At most three sleeps
            overlap. That is the point.
          </P>
        ),
        code: sliceLines(workerPools, 20, 45),
      },
    ],
  },
  {
    slug: "14-rate-limiting",
    order: 13,
    title: "Rate limiting",
    deck: "A pool caps how many run at once. A limiter caps how often work starts.",
    segments: [
      {
        note: (
          <P>
            Tokens appear on a clock. Receiving from the ticker is the gate. Use{" "}
            <C>NewTicker</C> so you can Stop. Prints should sit about 200ms
            apart. The bound is time, not a worker count.
          </P>
        ),
        code: sliceLines(rateLimiting, 1, 22),
      },
      {
        note: (
          <P>
            A burst is extra tokens already in a mailbox. Spend three at once,
            then wait for refill. You should see a clump, then two slower lines.
          </P>
        ),
        code: sliceLines(rateLimiting, 24, 46),
      },
    ],
  },
  {
    slug: "15-stateful-goroutines",
    order: 14,
    title: "Stateful goroutines",
    deck: "Only one goroutine is allowed to touch the map. Everyone else messages it.",
    segments: [
      {
        note: (
          <P>
            Each request carries a private reply channel. When the client
            receive completes, the owner has already done the map op. No mutex
            on the map. The mutex is implied by “this G is the only one that
            indexes state.”
          </P>
        ),
        code: sliceLines(stateful, 1, 18),
      },
      {
        note: (
          <P>
            The owner selects among reads, writes, or cancel. Unbuffered ops
            mean the client parks until the owner takes the request.{" "}
            <C>go run -race</C> is quiet with no lock.
          </P>
        ),
        code: sliceLines(stateful, 20, 44),
      },
      {
        note: (
          <P>
            Clients finish, then one read, then stop. Cancel is cooperative: the
            owner must return so its defers run. Join the owner; do not Sleep
            and hope.
          </P>
        ),
        code: sliceLines(stateful, 46, 65),
      },
    ],
  },
  {
    slug: "11-context",
    order: 15,
    title: "Context",
    deck: "There is no kill button. Workers check a shared “please stop” and return.",
    segments: [
      {
        note: (
          <P>
            <C>Done()</C> is a channel. Cancel or a deadline closes it. If a
            parent cancels, children cancel. Always call the cancel you are
            given — defer it so the timer is freed on early return.
          </P>
        ),
        code: sliceLines(contextLesson, 1, 25),
      },
      {
        note: (
          <>
            <P>
              Timeout: the loop must return for defers to run. Cancel does not
              unwind this function from the outside.
            </P>
            <P>
              Parent cancel: start the child, then stop. Wait is the join. If
              the child ignored Done, Wait would hang — a leak you can see.
            </P>
          </>
        ),
        code: sliceLines(contextLesson, 27, 44),
      },
    ],
  },
  {
    slug: "12-deadlocks-leaks",
    order: 16,
    title: "Deadlocks and leaks",
    deck: "Parked, and the wakeup never comes.",
    segments: [
      {
        note: (
          <P>
            Unbuffered send finishes only when another goroutine is already
            receiving. The receive is the next line in the same goroutine, so it
            never starts. The runtime detector screams if every goroutine is
            asleep. Leave this commented so the rest can run.
          </P>
        ),
        code: sliceLines(deadlocks, 1, 16),
      },
      {
        note: (
          <P>
            A leak is sneakier: the program continues, one goroutine stays
            parked forever. Buffer 1 and a default on send mean the worker
            refuses to block after the timeout. Wait still joins. If the send
            leaked, Wait would hang.
          </P>
        ),
        code: sliceLines(deadlocks, 18, 50),
      },
    ],
  },
  {
    slug: "13-gmp-runtime",
    order: 17,
    title: "The Go runtime",
    deck: "How this is even possible — G, M, P, and a peek at parked work.",
    segments: [
      {
        note: (
          <>
            <P>
              To run Go code you need G + M + P. Park a G and the M can run a
              different G with the same P. A blocking syscall can stick the M in
              the kernel; the runtime may hand the P to another M. The netpoller
              parks network waiters off the M entirely.
            </P>
            <P>
              First prints: how many Ps may run Go code at once, how many cores,
              how many Gs right now.
            </P>
          </>
        ),
        code: sliceLines(gmp, 1, 13),
      },
      {
        note: (
          <>
            <P>
              Eight sleepers are eight parked Gs, not eight OS threads. Peek at
              the count while they still exist, then Wait. <C>GOMAXPROCS</C>{" "}
              caps Go code in parallel. It does not cap Gs you create, or Ms
              stuck in syscalls.
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
