import { MIN_GRID, MAX_GRID, MIN_COLORS, MAX_COLORS, TOTAL_LEVELS } from '../constants/config'

export interface DifficultyParams {
  gridSize: number
  numColors: number
  minPathLength: number
  seed: number
}

export function getDifficultyParams(level: number): DifficultyParams {
  const t = (level - 1) / (TOTAL_LEVELS - 1) // 0..1

  const gridSize = Math.round(MIN_GRID + t * (MAX_GRID - MIN_GRID))

  // Colors grow faster early (3→6 in first ~2000 levels), then slower
  const colorCurve = t < 0.2 ? (t / 0.2) * 0.5 : 0.5 + ((t - 0.2) / 0.8) * 0.5
  const numColors = Math.min(
    Math.round(MIN_COLORS + colorCurve * (MAX_COLORS - MIN_COLORS)),
    Math.floor((gridSize * gridSize) / 4), // safety: can't exceed cells/4
    MAX_COLORS,
  )

  return {
    gridSize,
    numColors,
    minPathLength: Math.max(3, Math.floor(gridSize * 0.4)),
    seed: (level * 2654435761) >>> 0, // Knuth multiplicative hash
  }
}
