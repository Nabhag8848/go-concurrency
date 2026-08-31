# Course UI

```bash
cd web
pnpm install
pnpm dev
```

## Deploy to Vercel

Import the repository and set Vercel's **Root Directory** to `web`.
Vercel will build the Vite app and deploy `api/compile.js` as the same-origin
`/api/compile` function used by the inline Run button. No environment variables
are required.
