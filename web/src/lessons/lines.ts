export function sliceLines(source: string, start: number, end: number): string {
  const lines = source.replace(/\n$/, "").split("\n");
  return `${lines.slice(start - 1, end).join("\n")}\n`;
}
