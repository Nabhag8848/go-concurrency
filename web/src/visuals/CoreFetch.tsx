import { RuntimeStage } from "./RuntimeStage"

export function CoreFetch() {
  return <RuntimeStage scene="cpu" title="core telemetry" caption="One core executes one instruction at a time." cue="Watch the instruction ring advance into the core." />
}
