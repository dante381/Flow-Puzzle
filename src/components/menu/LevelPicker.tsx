import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { LevelTile } from './LevelTile'
import { useProgressStore } from '../../store/progressStore'
import { TOTAL_LEVELS } from '../../constants/config'

const COLS = 5
const TILE_HEIGHT = 56 // px
const OVERSCAN = 4

export function LevelPicker() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const highestUnlocked = useProgressStore(s => s.highestUnlocked)

  const getHeight = useCallback(
    () => (typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.55, 480) : 400),
    [],
  )
  const [containerHeight, setContainerHeight] = useState(getHeight)

  useEffect(() => {
    const onResize = () => setContainerHeight(getHeight())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [getHeight])
  const rowCount = Math.ceil(TOTAL_LEVELS / COLS)
  const totalHeight = rowCount * TILE_HEIGHT

  // Scroll to current level on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const targetRow = Math.max(0, Math.floor((highestUnlocked - 1) / COLS) - 2)
    el.scrollTop = targetRow * TILE_HEIGHT
  }, [highestUnlocked])

  const startRow = Math.max(0, Math.floor(scrollTop / TILE_HEIGHT) - OVERSCAN)
  const endRow = Math.min(rowCount, startRow + Math.ceil(containerHeight / TILE_HEIGHT) + OVERSCAN * 2)

  const visibleItems = useMemo(() => {
    const result: { level: number; row: number; col: number }[] = []
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < COLS; col++) {
        const level = row * COLS + col + 1
        if (level > TOTAL_LEVELS) break
        result.push({ level, row, col })
      }
    }
    return result
  }, [startRow, endRow])

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto relative rounded-xl"
      style={{ height: containerHeight }}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      aria-label="Level selection grid"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ level, row, col }) => (
          <div
            key={level}
            style={{
              position: 'absolute',
              top: row * TILE_HEIGHT,
              left: `${(col / COLS) * 100}%`,
              width: `${100 / COLS}%`,
              height: TILE_HEIGHT,
              padding: '2px',
            }}
          >
            <LevelTile levelNumber={level} />
          </div>
        ))}
      </div>
    </div>
  )
}
