import { channelLessons } from "./channels"
import { memoryLessons } from "./memory"
import { osLessons } from "./os"
import type { Lesson } from "./types"

// The docs directories are the canonical curriculum order (00 through 16).
// Keep the site index and next-lesson navigation aligned with that sequence.
export const catalog: Lesson[] = [...osLessons, ...memoryLessons, ...channelLessons].toSorted(
  (first, second) => first.order - second.order,
)

export function getLesson(slug: string | undefined): Lesson | undefined {
  return catalog.find((lesson) => lesson.slug === slug)
}

export function getNextLesson(slug: string): Lesson | null {
  const index = catalog.findIndex((lesson) => lesson.slug === slug)
  if (index === -1 || index === catalog.length - 1) {
    return null
  }
  return catalog[index + 1] ?? null
}

export function getPreviousLesson(slug: string): Lesson | null {
  const index = catalog.findIndex((lesson) => lesson.slug === slug)
  if (index <= 0) return null
  return catalog[index - 1] ?? null
}
