import { useEffect, useState } from "react"

type RailState = {
  hasOverflow: boolean
  runnerTop: number
}

const initialRail: RailState = { hasOverflow: false, runnerTop: 0 }

export function LessonScrollRail() {
  const [rail, setRail] = useState<RailState>(initialRail)

  useEffect(() => {
    const update = () => {
      const documentHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const scrollableHeight = documentHeight - viewportHeight
      const hasOverflow = scrollableHeight > 1
      const runnerTop = hasOverflow
        ? (window.scrollY / scrollableHeight) * 96
        : 0

      setRail({ hasOverflow, runnerTop })
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  if (!rail.hasOverflow) return null

  return (
    <button
      type="button"
      className="lesson-scroll-rail"
      aria-label="Scroll through this lesson"
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const ratio = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo({ top: maxScroll * ratio, behavior: "smooth" })
      }}
    >
      <span className="lesson-scroll-runner" style={{ top: `${rail.runnerTop}%` }} aria-hidden="true">
        🏃
      </span>
      <span className="lesson-scroll-finish" aria-hidden="true">🏁</span>
    </button>
  )
}
