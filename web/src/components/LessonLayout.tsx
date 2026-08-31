import { Fragment, useState, type CSSProperties } from "react"

import type { Lesson } from "../lessons/types"
import { CopyButton } from "./CopyButton"
import { GoCode } from "./GoCode"
import { NextLessonLink } from "./NextLessonLink"
import { RunButton } from "./RunButton"
import { SiteHeader } from "./SiteHeader"

type LessonLayoutProps = {
  lesson: Lesson
  next: Lesson | null
}

type PlaygroundResponse = {
  Errors?: string
  Events?: Array<{ Message: string; Kind: "stdout" | "stderr" }>
}

function codeForDisplay(source: string): string {
  return source.replace(/^package main\s*\n+/, "")
}

function setupLineCount(source: string): number {
  const firstFunction = source.split("\n").findIndex((line) => line.startsWith("func "))
  return firstFunction > 0 ? firstFunction : 0
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
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<PlaygroundResponse | null>(null)
  const source = lesson.source ?? program

  async function runProgram() {
    setRunning(true)
    setOutput(null)
    try {
      const body = new URLSearchParams({ body: source, lesson: lesson.slug, version: "2" })
      const response = await fetch("/api/compile?output=json", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body,
      })
      if (!response.ok) throw new Error(`Go Playground returned ${response.status}`)
      setOutput(await response.json() as PlaygroundResponse)
    } catch (error) {
      setOutput({ Errors: error instanceof Error ? error.message : "Unable to reach Go Playground." })
    } finally {
      setRunning(false)
    }
  }

  return (
    <article className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 sm:py-12">
      <SiteHeader />
      <h1 className="mb-3 font-serif text-[clamp(2rem,1.75rem+1.2vw,2.55rem)] leading-[1.18] font-medium tracking-tight text-paper">
        {lesson.title}
      </h1>
      <p className="notes mb-12 max-w-2xl text-[1.05rem] text-mute italic">{lesson.deck}</p>

      {hasAside ? (
        <div className="relative grid grid-cols-1 items-start gap-x-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {lesson.segments.map((segment, index) => {
            const isFirstAside = index === firstAsideIndex
            const isLastAside = index === lastAsideIndex
            const isVisual = segment.visual !== undefined
            const segmentSource = segment.code ? codeForDisplay(segment.code).replace(/\n?$/, "\n") : null
            const hasOsConnection = isFirstAside && segmentSource !== null
            const setupHeight = `${setupLineCount(segmentSource ?? "") * 1.47}rem`
            const noteStyle = {
              "--code-top-padding": hasOsConnection ? "0rem" : isFirstAside ? "1.5rem" : "1rem",
              "--code-intro-height": hasOsConnection ? "0rem" : setupHeight,
            } as CSSProperties
            const osConnectionStyle = {
              minHeight: `calc(1.5rem + ${setupHeight})`,
            }

            return (
              <Fragment key={index}>
                <div className="notes pr-0 lg:pr-4">
                  {hasOsConnection ? (
                    <aside className="os-connection" style={osConnectionStyle}>
                      <p className="os-connection-label">OS connection</p>
                      <p>{lesson.osConnection}</p>
                    </aside>
                  ) : null}
                  <div className="lesson-note" style={noteStyle}>
                    {segment.note}
                  </div>
                </div>
                <div
                  className={[
                    isVisual
                      ? "visual-panel relative min-h-[1.5rem] py-2 lg:px-2"
                      : "relative min-h-[1.5rem] border-x border-well-edge bg-well px-4 py-4 lg:px-7",
                    !isVisual && isFirstAside ? "rounded-t-xl border-t border-well-edge pt-6" : "",
                    !isVisual && isLastAside ? "rounded-b-xl border-b border-well-edge pb-6" : "",
                  ].join(" ")}
                >
                  {isFirstAside && hasCode ? (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <RunButton running={running} onRun={() => { void runProgram() }} />
                      <CopyButton text={source} />
                    </div>
                  ) : null}
                  {segment.code !== undefined ? (
                    <GoCode source={segmentSource ?? ""} />
                  ) : (
                    (segment.visual ?? <div className="h-4" />)
                  )}
                </div>
              </Fragment>
            )
          })}
          {hasCode && output ? (
            <>
              <div className="hidden lg:block" />
              <section className="playground-output" aria-live="polite" aria-label="Program output">
                <div className="playground-output-title">
                  <span><span className="playground-prompt">$</span> go run main.go</span>
                  <span>{output.Errors ? "error" : "complete"}</span>
                </div>
                <pre className={output.Errors ? "playground-error" : ""}>
                  {output.Errors || output.Events?.map((event) => event.Message).join("") || "Program finished with no output."}
                </pre>
              </section>
            </>
          ) : null}
        </div>
      ) : (
        <div className="notes max-w-2xl space-y-6">
          {lesson.segments.map((segment, index) => (
            <div key={index}>{segment.note}</div>
          ))}
        </div>
      )}

      <NextLessonLink next={next} />
    </article>
  )
}
