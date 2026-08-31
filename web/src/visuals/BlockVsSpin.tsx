import { RuntimeStage } from "./RuntimeStage"

export function BlockVsSpin() {
  return <RuntimeStage scene="blocking" title="wait strategy" caption="Spinning burns a core; blocking returns it to the scheduler." cue="The right-side packet wakes a parked task without occupying a core." />
}
