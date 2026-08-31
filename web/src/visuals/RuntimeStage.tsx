import { useEffect, useRef, useState } from "react"

type Scene = "cpu" | "process" | "threads" | "parallel" | "blocking" | "scheduler" | "context" | "mux"

type RuntimeStageProps = {
  scene: Scene
  title: string
  caption: string
  cue: string
}

const ink = "#ebe4d6"
const dim = "#9a9286"
const line = "#312f2a"
const blue = "#8aa4c9"
const green = "#7fa98a"
const orange = "#d4785b"
const mono = '11px "IBM Plex Mono", ui-monospace, monospace'

function rounded(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius = 8) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

function label(context: CanvasRenderingContext2D, text: string, x: number, y: number, color = dim, align: CanvasTextAlign = "left", size = 11) {
  context.fillStyle = color
  context.font = `${size}px "IBM Plex Mono", ui-monospace, monospace`
  context.textAlign = align
  context.fillText(text, x, y)
}

function card(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, stroke = line) {
  rounded(context, x, y, width, height)
  context.fillStyle = "#161512"
  context.fill()
  context.strokeStyle = stroke
  context.lineWidth = 1
  context.stroke()
}

function glow(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha = 1) {
  const grad = context.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, `${color}${Math.round(alpha * 70).toString(16).padStart(2, "0")}`)
  grad.addColorStop(1, `${color}00`)
  context.fillStyle = grad
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
}

function dot(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha = 1) {
  context.globalAlpha = alpha
  glow(context, x, y, radius * 3.8, color, alpha)
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fillStyle = color
  context.fill()
  context.globalAlpha = 1
}

function wire(context: CanvasRenderingContext2D, from: [number, number], to: [number, number], color = line, dashed = true) {
  context.beginPath()
  context.moveTo(...from)
  context.lineTo(...to)
  context.strokeStyle = color
  context.lineWidth = 1
  context.setLineDash(dashed ? [3, 5] : [])
  context.stroke()
  context.setLineDash([])
}

function sceneCpu(context: CanvasRenderingContext2D, t: number) {
  label(context, "INSTRUCTION RING", 22, 28)
  const ops = ["LOAD", "ADD", "STORE", "JMP", "CALL"]
  const active = Math.floor(t * 1.5) % ops.length
  ops.forEach((op, index) => {
    const x = 20 + index * 83
    card(context, x, 42, 70, 30, index === active ? orange : line)
    label(context, op, x + 35, 61, index === active ? ink : dim, "center", 10)
  })
  const target = 20 + active * 83 + 35
  glow(context, target, 57, 44, orange, 0.8)
  card(context, 20, 102, 420, 108, "#454038")
  label(context, "CORE 0", 38, 130, orange)
  label(context, "EXECUTING", 405, 130, green, "right", 10)
  const pulse = 0.55 + Math.sin(t * 7) * 0.3
  dot(context, 416, 122, 4.5, green, pulse)
  card(context, 38, 147, 112, 34)
  label(context, "PC", 49, 168)
  label(context, `0x0${(0x4a2 + active * 16).toString(16).toUpperCase()}`, 139, 168, ink, "right")
  label(context, "REGISTERS", 183, 158)
  for (let i = 0; i < 5; i++) card(context, 183 + i * 31, 166, 23, 15, i === active ? orange : line)
  label(context, "THREAD STATE = PC + REGS + STACK", 38, 200, dim, "left", 10)
}

function sceneProcess(context: CanvasRenderingContext2D, t: number) {
  const crash = (Math.sin(t * 1.4) + 1) / 2
  ;[[28, orange, "PID 412", "private heap"], [252, green, "PID 413", "private heap"]].forEach(([x, color, pid, memory], i) => {
    card(context, x as number, 42, 180, 150, color as string)
    label(context, pid as string, (x as number) + 16, 68, color as string)
    label(context, memory as string, (x as number) + 16, 92)
    for (let p = 0; p < 4; p++) card(context, (x as number) + 16 + (p % 2) * 72, 105 + Math.floor(p / 2) * 30, 58, 20, line)
    if (i === 0) {
      dot(context, (x as number) + 90, 150, 7 + crash * 8, orange, crash)
      label(context, crash > 0.72 ? "FAULT" : "running", (x as number) + 90, 176, crash > 0.72 ? orange : dim, "center")
    } else {
      dot(context, (x as number) + 90, 150, 6, green, 0.85)
      label(context, "still running", (x as number) + 90, 176, green, "center")
    }
  })
  wire(context, [208, 117], [252, 117])
  label(context, "OS boundary", 230, 109, dim, "center", 9)
  label(context, "CRASH DOES NOT CROSS AN ADDRESS SPACE", 230, 220, dim, "center", 10)
}

function sceneThreads(context: CanvasRenderingContext2D, t: number) {
  card(context, 22, 30, 416, 180, "#454038")
  label(context, "ONE PROCESS / SHARED ADDRESS SPACE", 42, 57)
  card(context, 170, 80, 120, 55, orange)
  label(context, "SHARED HEAP", 230, 102, dim, "center", 10)
  const value = Math.floor(t * 2) % 4
  label(context, `counter: ${value}`, 230, 122, orange, "center", 14)
  const a = (Math.sin(t * 1.25) + 1) / 2
  const b = (Math.sin(t * 1.25 + Math.PI) + 1) / 2
  ;[[75, blue, "T1", a], [385, green, "T2", b]].forEach(([x, color, name, progress]) => {
    const px = (x as number) + ((230 - (x as number)) * (progress as number) * 0.5)
    dot(context, px, 165, 12, color as string)
    label(context, name as string, px, 169, "#12110f", "center", 9)
    label(context, "private stack", x as number, 195, dim, "center", 9)
  })
  wire(context, [90, 155], [170, 120], blue)
  wire(context, [370, 155], [290, 120], green)
  label(context, "BOTH CAN TOUCH THIS VALUE", 230, 235, dim, "center", 10)
}

function sceneParallel(context: CanvasRenderingContext2D, t: number) {
  label(context, "CONCURRENT", 24, 28, blue)
  label(context, "one core", 416, 28, dim, "right", 10)
  card(context, 22, 42, 416, 46, "#454038")
  const phase = (t % 3.6) / 3.6
  const isA = phase < 0.5
  context.fillStyle = isA ? blue : green
  rounded(context, 30, 52, 400, 26, 4); context.fill()
  context.globalAlpha = 0.26; context.fillStyle = isA ? green : blue
  rounded(context, 30, 52, 400, 26, 4); context.fill(); context.globalAlpha = 1
  label(context, isA ? "A owns the core" : "B owns the core", 230, 70, "#12110f", "center", 11)
  dot(context, 30 + phase * 400, 65, 5, ink)
  label(context, "PARALLEL", 24, 126, green)
  label(context, "two cores", 416, 126, dim, "right", 10)
  ;[[145, blue, "CORE 0 / A"], [185, green, "CORE 1 / B"]].forEach(([y, color, text]) => {
    card(context, 22, y as number, 416, 26, color as string)
    context.fillStyle = color as string; rounded(context, 30, (y as number) + 6, 400, 14, 3); context.fill()
    dot(context, 30 + ((t * 70 + (y as number)) % 400), (y as number) + 13, 4, ink)
    label(context, text as string, 230, (y as number) + 17, "#12110f", "center", 10)
  })
  label(context, "TWO MARKERS MOVE AT THE SAME INSTANT", 230, 232, dim, "center", 10)
}

function sceneBlocking(context: CanvasRenderingContext2D, t: number) {
  const spin = t * 4
  ;[[22, orange, "BUSY WAIT", "core remains occupied"], [240, green, "BLOCK", "core returns to scheduler"]].forEach(([x, color, name, sub], index) => {
    card(context, x as number, 34, 198, 165, color as string)
    label(context, name as string, (x as number) + 99, 62, color as string, "center")
    if (index === 0) {
      context.beginPath(); context.arc((x as number) + 99, 120, 35, 0, Math.PI * 2); context.strokeStyle = line; context.lineWidth = 7; context.stroke()
      context.beginPath(); context.arc((x as number) + 99, 120, 35, spin, spin + 1.2); context.strokeStyle = orange; context.lineWidth = 7; context.stroke()
      dot(context, (x as number) + 99, 120, 5, orange)
    } else {
      card(context, (x as number) + 30, 103, 138, 34, green)
      label(context, "PARKED / I-O", (x as number) + 99, 125, green, "center", 10)
      const packet = ((t * 45) % 120)
      dot(context, (x as number) + 35 + packet, 157, 4, blue)
    }
    label(context, sub as string, (x as number) + 99, 180, dim, "center", 9)
  })
  label(context, "WAITING SHOULD NOT BURN A CORE", 230, 228, dim, "center", 10)
}

function sceneScheduler(context: CanvasRenderingContext2D, t: number) {
  const states = [[78, orange, "RUNNING", "owns a core"], [230, blue, "RUNNABLE", "waiting in queue"], [382, green, "BLOCKED", "waiting for I/O"]] as const
  states.forEach(([x, color, name, detail], i) => {
    const active = i === Math.floor(t / 1.9) % 3
    card(context, x - 58, 54, 116, 112, active ? color : line)
    label(context, name, x, 82, color, "center", 10)
    if (i === 1) [0, 1, 2].forEach((n) => dot(context, x - 23 + n * 23, 112 + (n % 2) * 15, 7, blue, 1 - n * 0.2))
    else dot(context, x, 117, 16, color, active ? 0.95 : 0.55)
    label(context, detail, x, 151, dim, "center", 8)
  })
  const phase = (t % 5.7) / 5.7
  const railY = 198
  wire(context, [78, railY], [382, railY], "#454038", false)
  ;[78, 230, 382].forEach((x, index) => {
    dot(context, x, railY, 4, index === Math.floor(phase * 3) ? ink : line)
  })
  const railX = 78 + phase * 304
  dot(context, railX, railY, 6, ink)
  label(context, phase < 0.33 ? "DISPATCH" : phase < 0.66 ? "I/O WAIT" : "WAKE", 230, 225, phase < 0.33 ? orange : phase < 0.66 ? green : blue, "center", 10)
}

function sceneContext(context: CanvasRenderingContext2D, t: number) {
  const phase = (t % 4.2) / 4.2
  const x = 82 + phase * 276
  ;[[82, blue, "THREAD A"], [220, orange, "KERNEL"], [358, green, "THREAD B"]].forEach(([cx, color, title]) => {
    card(context, (cx as number) - 51, 42, 102, 124, color as string)
    label(context, title as string, cx as number, 68, color as string, "center", 10)
    ;["PC", "R1", "SP"].forEach((item, i) => { card(context, (cx as number) - 35, 85 + i * 25, 70, 17); label(context, item, (cx as number) - 27, 97 + i * 25, dim, "left", 8) })
  })
  const railY = 193
  wire(context, [82, railY], [358, railY], "#454038", false)
  ;[[82, blue, "SAVE"], [220, orange, "DECIDE"], [358, green, "RESTORE"]].forEach(([railX, color, stage]) => {
    dot(context, railX as number, railY, 4, color as string)
    label(context, stage as string, railX as number, 211, color as string, "center", 8)
  })
  dot(context, x, railY, 7, ink)
  label(context, phase < 0.33 ? "A → KERNEL" : phase < 0.66 ? "SCHEDULER HAND-OFF" : "KERNEL → B", 230, 233, phase < 0.33 ? blue : phase < 0.66 ? orange : green, "center", 10)
}

function sceneMux(context: CanvasRenderingContext2D, t: number) {
  label(context, "GOROUTINES / G", 22, 26)
  const g = Array.from({ length: 8 }, (_, i) => ({ x: 42 + i * 39, y: 58 }))
  g.forEach((point, i) => dot(context, point.x, point.y, 9, i === Math.floor(t * 1.4) % 8 ? orange : ink, 0.7))
  g.forEach((point, i) => label(context, `G${i}`, point.x, point.y + 3, "#12110f", "center", 7))
  label(context, "RUNTIME SCHEDULER", 230, 102, orange, "center", 10)
  card(context, 178, 112, 104, 32, orange)
  wire(context, [118, 70], [195, 112], blue)
  wire(context, [274, 70], [260, 112], green)
  ;[[105, blue, "M0"], [355, green, "M1"]].forEach(([x, color, name], index) => {
    card(context, (x as number) - 57, 170, 114, 38, color as string)
    label(context, name as string, x as number, 193, color as string, "center", 12)
    dot(context, (x as number) + (((t * 40 + index * 55) % 74) - 37), 189, 7, index === 0 ? orange : ink)
  })
  wire(context, [210, 144], [105, 170], blue); wire(context, [250, 144], [355, 170], green)
  label(context, "MANY Gs · A FEW KERNEL-VISIBLE Ms", 230, 229, dim, "center", 10)
}

function drawScene(context: CanvasRenderingContext2D, scene: Scene, t: number) {
  context.clearRect(0, 0, 460, 250)
  const background = context.createLinearGradient(0, 0, 460, 250)
  background.addColorStop(0, "#12110f")
  background.addColorStop(1, "#1b1a17")
  context.fillStyle = background
  context.fillRect(0, 0, 460, 250)
  context.font = mono
  switch (scene) {
    case "cpu": sceneCpu(context, t); break
    case "process": sceneProcess(context, t); break
    case "threads": sceneThreads(context, t); break
    case "parallel": sceneParallel(context, t); break
    case "blocking": sceneBlocking(context, t); break
    case "scheduler": sceneScheduler(context, t); break
    case "context": sceneContext(context, t); break
    case "mux": sceneMux(context, t); break
  }
}

export function RuntimeStage({ scene, title, caption, cue }: RuntimeStageProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const start = useRef(performance.now())
  const pausedAt = useRef(0)
  const [paused, setPaused] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const context = element.getContext("2d")
    if (!context) return
    let frame = 0
    const resize = () => {
      const bounds = element.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      element.width = Math.max(1, Math.floor(bounds.width * ratio))
      element.height = Math.max(1, Math.floor(bounds.width * ratio * 250 / 460))
      context.setTransform(element.width / 460, 0, 0, element.height / 250, 0, 0)
      const elapsed = paused ? pausedAt.current : (performance.now() - start.current) / 1000
      drawScene(context, scene, elapsed)
    }
    const render = (now: number) => {
      const elapsed = paused ? pausedAt.current : (now - start.current) / 1000
      drawScene(context, scene, elapsed)
      if (!paused) frame = requestAnimationFrame(render)
    }
    resize()
    render(performance.now())
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [paused, scene])

  function toggle() {
    if (paused) start.current = performance.now() - pausedAt.current * 1000
    else pausedAt.current = (performance.now() - start.current) / 1000
    setPaused((value) => !value)
  }

  function replay() {
    start.current = performance.now()
    pausedAt.current = 0
    setPaused(false)
  }

  return (
    <figure className="runtime-stage m-0" aria-label={`${title}. ${caption}`}>
      <div className="runtime-stage-topline"><span>OS LAB / {title}</span><span className="runtime-status">{paused ? "paused" : "live"}</span></div>
      <canvas ref={canvas} className="runtime-canvas" role="img" aria-label={caption} />
      <figcaption className="runtime-footer">
        <span><strong>{caption}</strong><small>{cue}</small></span>
        <span className="runtime-controls"><button type="button" onClick={toggle} aria-pressed={paused}>{paused ? "play" : "pause"}</button><button type="button" onClick={replay}>replay</button></span>
      </figcaption>
    </figure>
  )
}
