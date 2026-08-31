import type { ReactNode } from "react"

export type Segment = {
  note: ReactNode
  code?: string
  visual?: ReactNode
}

export type Lesson = {
  slug: string
  order: number
  title: string
  deck: string
  osConnection: string
  source?: string
  segments: Segment[]
}
