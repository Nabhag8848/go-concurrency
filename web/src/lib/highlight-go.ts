export type GoTokenKind = "kw" | "str" | "com" | "num" | "plain"

export type GoToken = {
  kind: GoTokenKind
  value: string
}

const KEYWORDS =
  /^(package|import|func|return|if|else|for|range|go|defer|var|const|type|struct|map|chan|select|case|default|break|continue|switch|fallthrough|interface|make|new|nil|true|false|iota|go|range|func)\b/

export function tokenizeGo(source: string): GoToken[] {
  const tokens: GoToken[] = []
  let i = 0

  while (i < source.length) {
    if (source.startsWith("//", i)) {
      const end = source.indexOf("\n", i)
      const next = end === -1 ? source.length : end
      tokens.push({ kind: "com", value: source.slice(i, next) })
      i = next
      continue
    }

    const quote = source[i]
    if (quote === '"' || quote === "`" || quote === "'") {
      let j = i + 1
      if (quote === "`") {
        j = source.indexOf("`", j)
        j = j === -1 ? source.length : j + 1
      } else {
        while (j < source.length) {
          if (source[j] === "\\") {
            j += 2
            continue
          }
          if (source[j] === quote) {
            j += 1
            break
          }
          j += 1
        }
      }
      tokens.push({ kind: "str", value: source.slice(i, j) })
      i = j
      continue
    }

    if (/[0-9]/.test(source[i] ?? "")) {
      let j = i
      while (j < source.length && /[0-9a-fA-FxX._]/.test(source[j] ?? "")) {
        j += 1
      }
      tokens.push({ kind: "num", value: source.slice(i, j) })
      i = j
      continue
    }

    if (/[A-Za-z_]/.test(source[i] ?? "")) {
      let j = i
      while (j < source.length && /[A-Za-z0-9_]/.test(source[j] ?? "")) {
        j += 1
      }
      const word = source.slice(i, j)
      tokens.push({
        kind: KEYWORDS.test(word) ? "kw" : "plain",
        value: word,
      })
      i = j
      continue
    }

    tokens.push({ kind: "plain", value: source[i] ?? "" })
    i += 1
  }

  return tokens
}

const TOKEN_CLASS: Record<GoTokenKind, string> = {
  kw: "text-ember",
  str: "text-pine",
  com: "text-mute/80 italic",
  num: "text-dusk",
  plain: "text-ash",
}

export function tokenClassName(kind: GoTokenKind): string {
  return TOKEN_CLASS[kind]
}
