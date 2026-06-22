import type { GameState } from '../types'

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  palette: string[],
  cellSize: number,
  dpr: number,
): void {
  const { level, flows } = state
  const { gridSize } = level
  const total = gridSize * cellSize

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, total, total)

  drawGrid(ctx, gridSize, cellSize, total)
  drawPipes(ctx, flows, palette, cellSize)
  drawEndpoints(ctx, state, palette, cellSize)

  ctx.restore()
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number,
  total: number,
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  for (let i = 0; i <= gridSize; i++) {
    const x = i * cellSize
    const y = i * cellSize
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, total); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(total, y); ctx.stroke()
  }
}

function drawPipes(
  ctx: CanvasRenderingContext2D,
  flows: GameState['flows'],
  palette: string[],
  cellSize: number,
) {
  const pipeRadius = cellSize * 0.28

  for (const flow of flows) {
    if (flow.cells.length < 2) continue
    ctx.strokeStyle = palette[flow.color] ?? '#888'
    ctx.lineWidth = pipeRadius * 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = flow.complete ? 1 : 0.85
    ctx.beginPath()
    flow.cells.forEach((cell, i) => {
      const x = cell.col * cellSize + cellSize / 2
      const y = cell.row * cellSize + cellSize / 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

function drawEndpoints(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  palette: string[],
  cellSize: number,
) {
  const { level, flows } = state
  const dotRadius = cellSize * 0.36

  for (const ep of level.endpoints) {
    const flow = flows.find(f => f.color === ep.color)
    const isConnected = flow?.complete ?? false

    for (const cell of [ep.a, ep.b]) {
      const x = cell.col * cellSize + cellSize / 2
      const y = cell.row * cellSize + cellSize / 2
      const color = palette[ep.color] ?? '#888'

      // Outer glow when connected
      if (isConnected) {
        ctx.shadowColor = color
        ctx.shadowBlur = cellSize * 0.4
      }

      // Filled circle
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'

      // Inner highlight ring
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = cellSize * 0.04
      ctx.beginPath()
      ctx.arc(x, y, dotRadius * 0.6, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

}
