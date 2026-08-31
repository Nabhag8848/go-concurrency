import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function sourceForRunner(source: string, lesson: string | null) {
  if (lesson !== "03-shared-memory-races") return source

  return source
    .replace('\t"fmt"\n\t"time"', '\t"fmt"\n\t"runtime"\n\t"time"')
    .replace(
      "\t\t\t\tcounter++",
      "\t\t\t\tvalue := counter\n\t\t\t\truntime.Gosched()\n\t\t\t\tcounter = value + 1",
    )
}

function playgroundRunner(): Plugin {
  return {
    name: "playground-runner",
    configureServer(server) {
      server.middlewares.use("/api/compile", (request, response, next) => {
        if (request.method !== "POST") return next()

        const chunks: Buffer[] = []
        request.on("data", (chunk: Buffer) => chunks.push(chunk))
        request.on("error", next)
        request.on("end", async () => {
          try {
            const fields = new URLSearchParams(Buffer.concat(chunks).toString())
            const source = fields.get("body")
            if (!source) {
              response.writeHead(400, { "Content-Type": "application/json" })
              response.end(JSON.stringify({ Errors: "No Go source was provided." }))
              return
            }

            const freshSource = `${sourceForRunner(source, fields.get("lesson")).trimEnd()}\n\n// playground-run: ${crypto.randomUUID()}\n`
            const upstream = await fetch("https://play.golang.org/compile?output=json", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ body: freshSource, version: "2" }),
            })
            response.writeHead(upstream.status, {
              "Content-Type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
              "Cache-Control": "no-store",
            })
            response.end(await upstream.text())
          } catch {
            response.writeHead(502, { "Content-Type": "application/json" })
            response.end(JSON.stringify({ Errors: "Go Playground is temporarily unavailable. Please try again." }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), playgroundRunner()],
  server: {
    fs: {
      allow: [path.resolve(rootDir, "..")],
    },
  },
});
