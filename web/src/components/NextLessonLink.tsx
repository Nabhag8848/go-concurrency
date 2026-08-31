import { Link } from "react-router"

import type { Lesson } from "../lessons/types"

type NextLessonLinkProps = {
  previous: Lesson | null
  next: Lesson | null
}

export function NextLessonLink({ previous, next }: NextLessonLinkProps) {
  return (
    <nav className="mt-16 flex flex-col gap-3 border-t border-rule pt-6 sm:flex-row sm:items-stretch sm:justify-between" aria-label="Lesson navigation">
      {previous ? (
        <Link to={`/lessons/${previous.slug}`} className="lesson-nav-link lesson-nav-previous">
          <span className="lesson-nav-label">← Previous lesson</span>
          <span>{previous.title}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link to={`/lessons/${next.slug}`} className="lesson-nav-link lesson-nav-next">
          <span className="lesson-nav-label">Next lesson →</span>
          <span>{next.title}</span>
        </Link>
      ) : (
        <Link to="/" className="lesson-nav-link lesson-nav-next">
          <span className="lesson-nav-label">Course complete</span>
          <span>Back to the index</span>
        </Link>
      )}
    </nav>
  )
}
