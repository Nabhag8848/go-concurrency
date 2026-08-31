type RunButtonProps = {
  running: boolean
  onRun: () => void
}

export function RunButton({ running, onRun }: RunButtonProps) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={running}
      className="run-button rounded-md px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase transition-colors"
    >
      <span className="run-button-dot" aria-hidden="true" />
      {running ? "Running" : "Run"}
    </button>
  )
}
