import { Fragment } from "react"

import type { Lesson } from "../lessons/types"
import { CopyButton } from "./CopyButton"
import { GoCode } from "./GoCode"
import { NextLessonLink } from "./NextLessonLink"
import { SiteHeader } from "./SiteHeader"

type LessonLayoutProps = {
  lesson: Lesson
  next: Lesson | null
}

export function LessonLayout({ lesson, next }: LessonLayoutProps) {
  const program = lesson.segments.map((segment) => segment.code ?? "").join("")
  const hasCode = program.trim().length > 0
  const hasVisual = lesson.segments.some((segment) => segment.visual)
  const hasAside = hasCode || hasVisual
  const lastAsideIndex = lesson.segments.reduce((last, item, itemIndex) => {
    if (item.code !== undefined || item.visual) {
      return itemIndex
    }
    return last
  }, 0)
  const firstAsideIndex = lesson.segments.findIndex(
    (item) => item.code !== undefined || item.visual,
  )

  return (
    <article className="mx-auto max-w-[1360px] px-6 py-12 sm:px-10 sm:py-16">
      <SiteHeader />
      <h1 className="mb-3 font-serif text-[2.2rem] leading-[1.18] font-medium tracking-tight text-paper sm:text-[2.55rem]">
        {lesson.title}
      </h1>
      <p className="notes mb-12 max-w-2xl text-[1.05rem] text-mute italic">{lesson.deck}</p>

      {hasAside ? (
        <div className="relative grid grid-cols-1 items-start gap-x-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.28fr)]">
          {lesson.segments.map((segment, index) => {
            const isFirstAside = index === firstAsideIndex
            const isLastAside = index === lastAsideIndex

            return (
              <Fragment key={index}>
                <div className="notes py-3 pr-0 lg:pr-4">
                  {segment.note}
                </div>
                <div
                  className={[
                    "relative min-h-[1.5rem] px-4 py-4 lg:px-7",
                    "bg-well",
                    isFirstAside ? "rounded-t-xl border-t border-well-edge pt-6" : "",
                    isLastAside ? "rounded-b-xl border-b border-well-edge pb-6" : "",
                    "border-x border-well-edge",
                  ].join(" ")}
                >
                  {isFirstAside && hasCode ? <CopyButton text={program} /> : null}
                  {segment.code !== undefined ? (
                    <GoCode source={segment.code.endsWith("\n") ? segment.code : `${segment.code}\n`} />
                  ) : (
                    (segment.visual ?? <div className="h-4" />)
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>
      ) : (
        <div className="notes max-w-2xl space-y-6">
          {lesson.segments.map((segment, index) => (
            <div key={index}>{segment.note}</div>
          ))}
        </div>
      )}

      {hasAside ? (
        <p className="mt-4 text-right font-mono text-[11px] tracking-wide text-mute uppercase">
          {String(lesson.order).padStart(2, "0")} · {hasCode ? `${lesson.slug}.go` : "machine picture"}
        </p>
      ) : null}

      <NextLessonLink next={next} />
    </article>
  )
}
