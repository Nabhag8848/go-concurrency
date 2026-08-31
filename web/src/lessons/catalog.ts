import { channelLessons } from "./channels"
import { memoryLessons } from "./memory"
import { osLessons } from "./os"
import type { Lesson } from "./types"

export const catalog: Lesson[] = [...osLessons, ...memoryLessons, ...channelLessons]

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
