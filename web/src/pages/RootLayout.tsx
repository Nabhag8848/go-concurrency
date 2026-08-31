import { Outlet, ScrollRestoration } from "react-router"

export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
