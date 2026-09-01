# Learn Go Concurrency from First Principles

An interactive guide to understanding how concurrent work moves through a machine—then applying that mental model in Go.

[Visit the course](https://concurrency.nabhag.dev/)

![Learn Go Concurrency from First Principles course preview](web/public/social-preview.png)

## What is in this repository?

- `web/` — the Vite + React course interface, interactive visualizations, and in-browser Go examples.
- `docs/` — the Go source files and notes that power the course lessons.

## Run the project locally

### Prerequisites

- Node.js 20 or later
- pnpm 8 or later

### Start the web app

```bash
cd web
pnpm install --frozen-lockfile
pnpm dev
```

Vite will print a local URL, usually `http://localhost:5173`.

### Build for production

```bash
cd web
pnpm build
```

To preview the production build locally:

```bash
pnpm preview
```

## Deployment

The site is deployed on Vercel. When importing this repository, set Vercel's **Root Directory** to `web`.

The project configuration in `web/vercel.json` handles the build, SPA lesson routing, security headers, and the same-origin `/api/compile` endpoint used by the Run button. No environment variables are required.

## Social sharing preview

The image above is also used when the site is shared on social platforms. Its metadata lives in `web/index.html`, and the image asset is `web/public/social-preview.png`.
