import type { ReactNode } from "react"

type DiagramProps = {
  caption: string
  children: ReactNode
}

export function Diagram({ caption, children }: DiagramProps) {
  return (
    <figure className="viz m-0">
      {children}
      <figcaption className="mt-3 font-mono text-[10px] leading-snug tracking-[0.14em] text-mute uppercase">
        {caption}
      </figcaption>
    </figure>
  )
}
