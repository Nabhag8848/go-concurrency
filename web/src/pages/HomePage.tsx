import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { SiteHeader } from "../components/SiteHeader";
import type { Lesson } from "../lessons/types";

type HomeData = {
  lessons: Lesson[];
};

export function HomePage() {
  const { lessons } = useLoaderData<HomeData>();
  const listRef = useRef<HTMLDivElement>(null);
  const [hasMoreLessons, setHasMoreLessons] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateScrollCue = () => {
      setHasMoreLessons(list.scrollTop + list.clientHeight < list.scrollHeight - 2);
    };

    updateScrollCue();
    list.addEventListener("scroll", updateScrollCue, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollCue);
    resizeObserver.observe(list);

    return () => {
      list.removeEventListener("scroll", updateScrollCue);
      resizeObserver.disconnect();
    };
  }, [lessons.length]);

  const scrollToMoreLessons = () => {
    const list = listRef.current;
    if (!list) return;

    list.scrollBy({
      top: Math.max(180, list.clientHeight * 0.72),
      behavior: "smooth",
    });
  };

  return (
    <main className="home-page mx-auto max-w-[1520px] px-5 py-12 sm:px-8 sm:py-16">
      <SiteHeader />
      <div className="home-course-grid">
        <section className="home-course-intro">
          <p className="mb-3 font-mono text-[10px] tracking-[0.14em] text-ember uppercase">
            An interactive guide to Go concurrency · 17 lessons
          </p>
          <h1 className="mb-5 max-w-2xl font-serif text-[clamp(2.65rem,2.05rem+2.1vw,4rem)] leading-[1.04] font-medium tracking-tight text-paper">
            Learn Go concurrency <span className="text-ash italic">from first principles.</span>
          </h1>
          <div className="home-intro notes max-w-2xl text-[1.02rem] text-mute">
            <p>
              <strong>See the work move before you write the code.</strong> Begin
              with CPUs, processes, threads, scheduling, and blocking—the pieces
              that decide what concurrent code can actually do.
            </p>
            <p>
              <strong>Take the course in order.</strong> The opening visual lessons
              build operating-system intuition. Every later Go lesson then connects
              goroutines, channels, locks, and the runtime back to that model—so
              concurrency feels like a system you can reason about, not syntax to
              memorize.
            </p>
          </div>
        </section>
        <section className="home-course-list">
          <p className="home-lessons-heading mb-3 font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
            Lessons
          </p>
          <div ref={listRef} className="home-course-scroll">
            <ol className="home-lessons m-0 list-none p-0">
              {lessons.map((lesson) => (
                <li key={lesson.slug} className="border-t border-rule">
                  <Link
                    to={`/lessons/${lesson.slug}`}
                    className="group flex items-baseline gap-4 py-3 no-underline"
                  >
                    <span className="w-7 shrink-0 font-mono text-[11px] text-mute">
                      {String(lesson.order).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="block font-serif text-[1.22rem] font-medium leading-tight text-paper group-hover:text-ember">
                        {lesson.title}
                      </span>
                      <span className="home-lesson-deck notes mt-1.5 block text-[0.94rem] leading-snug text-mute">
                        {lesson.deck}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          {hasMoreLessons && (
            <button
              type="button"
              className="home-scroll-cue"
              onClick={scrollToMoreLessons}
              aria-label="Show more lessons"
            >
              More lessons below <span>↓</span>
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
