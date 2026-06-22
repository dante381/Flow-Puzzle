import { useEffect, useRef, useCallback, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useProgressStore } from '../store/progressStore'
import { useSettingsStore } from '../store/settingsStore'
import { renderFrame } from '../engine/renderer'
import { PALETTES } from '../constants/colors'
import { GameHUD } from '../components/game/GameHUD'
import { LevelComplete } from '../components/game/LevelComplete'
import { A11yOverlay } from '../components/game/A11yOverlay'
import { announce } from '../utils/a11y'
import type { Cell } from '../types'

export function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastCellRef = useRef<{ row: number; col: number } | null>(null)
  const pointerPosRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  const state = useGameStore(s => s.state)
  const interactCell = useGameStore(s => s.interactCell)
  const stopDraw = useGameStore(s => s.stopDraw)
  const tick = useGameStore(s => s.tick)
  const loadLevel = useGameStore(s => s.loadLevel)
  const completeLevel = useProgressStore(s => s.completeLevel)
  const colorblindMode = useSettingsStore(s => s.colorblindMode)
  const selectedLevel = useUIStore(s => s.selectedLevel) ?? 1
  const [canvasSize, setCanvasSize] = useState(0)

  useEffect(() => {
    loadLevel(selectedLevel)
  }, [selectedLevel, loadLevel])

  useEffect(() => {
    if (!state || state.isComplete || state.isPaused) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state?.isComplete, state?.isPaused, tick])

  useEffect(() => {
    if (!state?.isComplete) return
    const { moveCount, elapsedSeconds, level } = state
    const totalCells = level.gridSize * level.gridSize
    const stars: 1 | 2 | 3 =
      moveCount <= totalCells ? 3
      : moveCount <= Math.round(totalCells * 1.5) ? 2
      : 1
    completeLevel(level.levelNumber, {
      stars,
      moveCount,
      timeSeconds: elapsedSeconds,
      solvedAt: Date.now(),
    })
    announce(`Level ${level.levelNumber} complete! ${stars} star${stars !== 1 ? 's' : ''}.`, 'assertive')
  }, [state?.isComplete])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setCanvasSize(Math.floor(Math.min(width, height - 8)))
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Imperative render — reads Zustand state directly, skips React render cycle.
  // Draws committed pipes + a semi-transparent tip to the live pointer position.
  const renderCanvas = useCallback(() => {
    const s = useGameStore.getState().state
    const canvas = canvasRef.current
    if (!s || !canvas || canvasSize === 0) return

    const dpr = window.devicePixelRatio || 1
    const targetW = canvasSize * dpr
    const targetH = canvasSize * dpr
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
      canvas.style.width = `${canvasSize}px`
      canvas.style.height = `${canvasSize}px`
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cellSize = canvasSize / s.level.gridSize
    const palette = PALETTES[colorblindMode] ?? PALETTES.none

    renderFrame(ctx, s, palette, cellSize, dpr)

    // Smooth pointer preview: extend the active pipe to exact pointer position
    const ptr = pointerPosRef.current
    if (s.activeColor !== null && ptr) {
      const flow = s.flows.find(f => f.color === s.activeColor)
      if (flow && flow.cells.length > 0) {
        const last = flow.cells[flow.cells.length - 1]
        const lx = last.col * cellSize + cellSize / 2
        const ly = last.row * cellSize + cellSize / 2
        ctx.save()
        ctx.scale(dpr, dpr)
        ctx.globalAlpha = 0.45
        ctx.strokeStyle = palette[s.activeColor] ?? '#888'
        ctx.lineWidth = cellSize * 0.56
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(lx, ly)
        ctx.lineTo(ptr.x, ptr.y)
        ctx.stroke()
        ctx.restore()
      }
    }
  }, [canvasSize, colorblindMode])

  // Subscribe to Zustand state changes and render via RAF, bypassing React's
  // render pipeline. Multiple updates in the same frame collapse into one draw.
  useEffect(() => {
    function scheduleRender() {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        renderCanvas()
      })
    }
    scheduleRender()
    const unsub = useGameStore.subscribe(scheduleRender)
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      unsub()
    }
  }, [renderCanvas])

  function interpolateCells(
    from: { row: number; col: number },
    to: { row: number; col: number },
  ): { row: number; col: number }[] {
    const result: { row: number; col: number }[] = []
    let { row, col } = from
    while (row !== to.row || col !== to.col) {
      const dr = to.row - row
      const dc = to.col - col
      if (Math.abs(dr) >= Math.abs(dc)) row += Math.sign(dr)
      else col += Math.sign(dc)
      result.push({ row, col })
    }
    return result
  }

  const getCell = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Cell | null => {
      const canvas = canvasRef.current
      if (!canvas || !state) return null
      const rect = canvas.getBoundingClientRect()
      const cellSize = rect.width / state.level.gridSize
      const row = Math.floor((e.clientY - rect.top) / cellSize)
      const col = Math.floor((e.clientX - rect.left) / cellSize)
      if (row < 0 || row >= state.level.gridSize || col < 0 || col >= state.level.gridSize) return null
      return { row, col }
    },
    [state?.level.gridSize, canvasSize],
  )

  // Schedule a render from pointer events without waiting for Zustand notification
  function requestRender() {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      renderCanvas()
    })
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen text-text-secondary">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto px-3">
      <GameHUD />

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center py-2"
        style={{ minHeight: 0 }}
      >
        <div style={{ position: 'relative', width: canvasSize, height: canvasSize, flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            className="touch-none"
            style={{ display: 'block' }}
            aria-hidden="true"
            onPointerDown={e => {
              const cell = getCell(e)
              if (cell) {
                e.currentTarget.setPointerCapture(e.pointerId)
                lastCellRef.current = cell
                const rect = canvasRef.current!.getBoundingClientRect()
                pointerPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
                interactCell(cell)
              }
            }}
            onPointerMove={e => {
              if (e.buttons === 0) return
              const canvas = canvasRef.current
              if (canvas) {
                const rect = canvas.getBoundingClientRect()
                pointerPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
                requestRender()
              }
              const cell = getCell(e)
              if (!cell) return
              const last = lastCellRef.current
              if (last) {
                for (const c of interpolateCells(last, cell)) interactCell(c)
              } else {
                interactCell(cell)
              }
              lastCellRef.current = cell
            }}
            onPointerUp={() => {
              pointerPosRef.current = null
              stopDraw()
              lastCellRef.current = null
              requestRender()
            }}
            onPointerLeave={e => {
              pointerPosRef.current = null
              if (e.buttons === 0) { stopDraw(); lastCellRef.current = null }
              requestRender()
            }}
            onPointerCancel={() => {
              pointerPosRef.current = null
              stopDraw()
              lastCellRef.current = null
              requestRender()
            }}
          />

          <A11yOverlay state={state} onCellActivate={interactCell} />

          {state.isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <div className="text-text-secondary text-lg font-medium">Paused</div>
                <div className="text-text-secondary/60 text-sm mt-1">Press ▶ to resume</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {state.isComplete && <LevelComplete />}
    </div>
  )
}
