import { RuntimeStage } from "./RuntimeStage"

export function ThreadsInHouse() {
  return <RuntimeStage scene="threads" title="shared heap" caption="Threads bring private stacks to one shared address space." cue="Both workers converge on the same counter." />
}
