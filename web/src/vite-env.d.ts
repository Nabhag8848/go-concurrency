/// <reference types="vite/client" />

declare module "*.go?raw" {
  const source: string
  export default source
}
