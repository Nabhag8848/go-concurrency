import { useState } from "react"

type CopyButtonProps = {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void copy()
      }}
      className="rounded-md border border-well-edge bg-well/90 px-2.5 py-1 font-mono text-[11px] tracking-wide text-mute uppercase transition-colors hover:border-ember/50 hover:text-paper"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
