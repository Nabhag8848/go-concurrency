import { RuntimeStage } from "./RuntimeStage"

export function UserSpaceMux() {
  return <RuntimeStage scene="mux" title="goroutine multiplexing" caption="The Go runtime maps many goroutines onto a few OS threads." cue="Watch the scheduler feed each kernel-visible worker." />
}
