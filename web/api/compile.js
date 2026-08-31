const playgroundCompile = "https://play.golang.org/compile?output=json"
const maxSourceBytes = 64 * 1024

function sourceForRunner(source, lesson) {
  if (lesson !== "03-shared-memory-races") return source

  // Keep the lesson's visible code at counter++, then widen the unsafe
  // load/store window only for the interactive demonstration.
  return source
    .replace('\t"fmt"\n\t"time"', '\t"fmt"\n\t"runtime"\n\t"time"')
    .replace(
      "\t\t\t\tcounter++",
      "\t\t\t\tvalue := counter\n\t\t\t\truntime.Gosched()\n\t\t\t\tcounter = value + 1",
    )
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json({ Errors: "Run expects a POST request." }, { status: 405 })
    }

    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return Response.json({ Errors: "Run expects form-encoded Go source." }, { status: 415 })
    }

    const encoded = await request.text()
    if (encoded.length > maxSourceBytes * 2) {
      return Response.json({ Errors: "This program is too large for Go Playground." }, { status: 413 })
    }

    const fields = new URLSearchParams(encoded)
    const source = fields.get("body")
    const lesson = fields.get("lesson")
    if (!source?.trim()) {
      return Response.json({ Errors: "No Go source was provided." }, { status: 400 })
    }
    if (new TextEncoder().encode(source).length > maxSourceBytes) {
      return Response.json({ Errors: "This program is too large for Go Playground." }, { status: 413 })
    }

    // The Playground caches executions by source. A unique comment keeps every
    // click a fresh run without changing the program a student sees or copies.
    const freshSource = `${sourceForRunner(source, lesson).trimEnd()}\n\n// playground-run: ${crypto.randomUUID()}\n`

    try {
      const upstream = await fetch(playgroundCompile, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ body: freshSource, version: "2" }),
      })
      const result = await upstream.text()

      return new Response(result, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      })
    } catch {
      return Response.json(
        { Errors: "Go Playground is temporarily unavailable. Please try again." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      )
    }
  },
}
