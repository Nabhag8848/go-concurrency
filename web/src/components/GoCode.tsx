import { tokenClassName, tokenizeGo } from "../lib/highlight-go"

type GoCodeProps = {
  source: string
}

export function GoCode({ source }: GoCodeProps) {
  const tokens = tokenizeGo(source)

  return (
    <pre className="m-0 overflow-x-auto font-mono text-[13.5px] leading-[1.7] whitespace-pre">
      <code>
        {tokens.map((token, index) => (
          <span key={index} className={tokenClassName(token.kind)}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}
