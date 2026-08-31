import { RuntimeStage } from "./RuntimeStage"

export function ContextSwitch() {
  return <RuntimeStage scene="context" title="context transfer" caption="A switch saves thread A's state before restoring thread B's." cue="Freeze the sequence at the kernel to inspect the hand-off." />
}
