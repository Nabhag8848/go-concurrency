import { RuntimeStage } from "./RuntimeStage"

export function SchedulerStates() {
  return <RuntimeStage scene="scheduler" title="scheduler state machine" caption="Only a running thread owns a CPU core." cue="Follow the white token through dispatch, I/O wait, and wake." />
}
