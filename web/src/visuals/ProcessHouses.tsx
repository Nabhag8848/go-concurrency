import { RuntimeStage } from "./RuntimeStage"

export function ProcessHouses() {
  return <RuntimeStage scene="process" title="process isolation" caption="A fault stays in the process that owns its memory." cue="The green process continues while the orange one faults." />
}
