import { Link } from "react-router"

import type { Lesson } from "../lessons/types"

type NextLessonLinkProps = {
  next: Lesson | null
}

export function NextLessonLink({ next }: NextLessonLinkProps) {
  if (!next) {
    return (
      <p className="mt-16 max-w-xl font-serif text-lg text-mute">
        That is the last lesson.{" "}
        <Link to="/" className="text-paper underline decoration-ember/60 underline-offset-4 hover:text-ember">
          Back to the index
        </Link>
        .
      </p>
    )
  }

  return (
    <p className="mt-16 font-serif text-lg">
      <span className="text-mute">Next example: </span>
      <Link
        to={`/lessons/${next.slug}`}
        className="text-paper underline decoration-ember/70 decoration-1 underline-offset-[6px] transition-colors hover:text-ember"
      >
        {next.title}
      </Link>
    </p>
  )
}
