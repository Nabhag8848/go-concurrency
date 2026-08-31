import { createBrowserRouter } from "react-router"

import { catalog, getLesson, getNextLesson, getPreviousLesson } from "./lessons/catalog"
import { HomePage } from "./pages/HomePage"
import { LessonErrorPage, LessonPage } from "./pages/LessonPage"
import { RootLayout } from "./pages/RootLayout"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
        loader: () => ({ lessons: catalog }),
      },
      {
        path: "lessons/:slug",
        Component: LessonPage,
        errorElement: <LessonErrorPage />,
        loader: ({ params }) => {
          const lesson = getLesson(params.slug)
          if (!lesson) {
            throw new Response("Lesson not found", { status: 404 })
          }
          return { lesson, previous: getPreviousLesson(lesson.slug), next: getNextLesson(lesson.slug) }
        },
      },
    ],
  },
])
