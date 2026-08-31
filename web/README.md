# Course UI

```bash
cd web
pnpm install
pnpm dev
```

## Deploy to Vercel

Import the repository and set Vercel's **Root Directory** to `web` once. That
one import setting cannot be set by a `vercel.json` stored inside `web`.

Everything else is committed in `vercel.json`: the Vite build and output paths,
frozen-lockfile install, SPA lesson routing, security headers, and the
same-origin `/api/compile` function used by the inline Run button. No
environment variables are required.
