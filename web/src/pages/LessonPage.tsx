import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "react-router"

import { LessonLayout } from "../components/LessonLayout"
import type { Lesson } from "../lessons/types"

type LessonData = {
  lesson: Lesson
  previous: Lesson | null
  next: Lesson | null
}

export function LessonPage() {
  const { lesson, previous, next } = useLoaderData<LessonData>()
  return <LessonLayout lesson={lesson} previous={previous} next={next} />
}

export function LessonErrorPage() {
  const error = useRouteError()
  const missing = isRouteErrorResponse(error) && error.status === 404

  return (
    <main className="mx-auto max-w-[640px] px-6 py-24">
      <p className="font-mono text-xs tracking-[0.18em] text-mute uppercase">
        {missing ? "Missing lesson" : "Something broke"}
      </p>
      <h1 className="mt-3 font-serif text-3xl">
        {missing ? "No lesson at this path." : "The page failed to load."}
      </h1>
      <p className="mt-8">
        <Link to="/" className="text-paper underline decoration-ember/70 underline-offset-4">
          Back to the index
        </Link>
      </p>
    </main>
  )
}
