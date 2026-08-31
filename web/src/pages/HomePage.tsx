import { Link, useLoaderData } from "react-router";

import { SiteHeader } from "../components/SiteHeader";
import type { Lesson } from "../lessons/types";

type HomeData = {
  lessons: Lesson[];
};

export function HomePage() {
  const { lessons } = useLoaderData<HomeData>();

  return (
    <main className="mx-auto max-w-[720px] px-5 py-10 sm:px-8 sm:py-12">
      <SiteHeader />
      <h1 className="mb-4 font-serif text-[2.4rem] leading-[1.15] font-medium tracking-tight text-paper">
        OS, then Go.
      </h1>
      <ol className="m-0 list-none p-0">
        {lessons.map((lesson) => (
          <li key={lesson.slug} className="border-t border-rule">
            <Link
              to={`/lessons/${lesson.slug}`}
              className="group flex items-baseline gap-5 py-4 no-underline"
            >
              <span className="w-8 shrink-0 font-mono text-xs text-mute">
                {String(lesson.order).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block font-serif text-xl font-medium text-paper group-hover:text-ember">
                  {lesson.title}
                </span>
                <span className="notes mt-1 block text-[0.95rem] text-mute">
                  {lesson.deck}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
