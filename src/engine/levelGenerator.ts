import { mulberry32, seededShuffle } from './prng'
import { getDifficultyParams } from './difficultyScaler'
import type { LevelData, Endpoint } from '../types'

export function cellKey(r: number, c: number): string {
  return `${r},${c}`
}

/**
 * Returns true if `pos` is orthogonally adjacent to any cell in `used`.
 * Used during placement to keep starting cells spread apart so no color
 * gets its head immediately enclosed by a neighbour's start cell.
 */
function isAdjacentToUsed(pos: number, used: Set<number>, gridSize: number): boolean {
  const row = Math.floor(pos / gridSize)
  const col = pos % gridSize
  if (row > 0 && used.has(pos - gridSize)) return true
  if (row < gridSize - 1 && used.has(pos + gridSize)) return true
  if (col > 0 && used.has(pos - 1)) return true
  if (col < gridSize - 1 && used.has(pos + 1)) return true
  return false
}

/**
 * Grows numColors paths simultaneously until all cells in the gridSize×gridSize
 * grid are covered. Each color starts at a random non-adjacent cell and extends
 * one step at a time. The first and last cells of each path become the endpoints
 * shown to the player. Guarantees every generated level has at least one solution
 * and that every color's two endpoints are distinct cells.
 */
function tryGenerate(
  gridSize: number,
  numColors: number,
  rng: () => number,
): Endpoint[] | null {
  const total = gridSize * gridSize
  // -1 = unassigned, 0..numColors-1 = belongs to that color
  const grid = new Int8Array(total).fill(-1)

  // Place one starting cell per color; reject cells adjacent to existing starts
  // so that no color's head is immediately enclosed on the first round.
  const paths: number[][] = []
  const used = new Set<number>()

  for (let c = 0; c < numColors; c++) {
    let pos: number
    let attempts = 0
    do {
      pos = Math.floor(rng() * total)
      attempts++
      if (attempts > 2000) return null
    } while (used.has(pos) || isAdjacentToUsed(pos, used, gridSize))
    used.add(pos)
    grid[pos] = c
    paths.push([pos])
  }

  let filled = numColors

  // Grow paths until all cells are filled or we're genuinely stuck.
  // When a path's head has no free neighbors, we reverse it and try the
  // other end — this dramatically reduces the chance of a color getting
  // permanently enclosed in large grids.
  let totalStuckRounds = 0

  while (filled < total) {
    const order = Array.from({ length: numColors }, (_, i) => i)
    seededShuffle(order, rng)

    let anyMoved = false

    for (const c of order) {
      const head = paths[c][paths[c].length - 1]
      const hrow = Math.floor(head / gridSize)
      const hcol = head % gridSize

      // Gather empty orthogonal neighbors of the current head
      let candidates: number[] = []
      if (hrow > 0 && grid[head - gridSize] === -1) candidates.push(head - gridSize)
      if (hrow < gridSize - 1 && grid[head + gridSize] === -1) candidates.push(head + gridSize)
      if (hcol > 0 && grid[head - 1] === -1) candidates.push(head - 1)
      if (hcol < gridSize - 1 && grid[head + 1] === -1) candidates.push(head + 1)

      if (candidates.length === 0) {
        // Head is stuck — try the other end of the path (path reversal trick)
        const tail = paths[c][0]
        const trow = Math.floor(tail / gridSize)
        const tcol = tail % gridSize
        const tailCandidates: number[] = []
        if (trow > 0 && grid[tail - gridSize] === -1) tailCandidates.push(tail - gridSize)
        if (trow < gridSize - 1 && grid[tail + gridSize] === -1) tailCandidates.push(tail + gridSize)
        if (tcol > 0 && grid[tail - 1] === -1) tailCandidates.push(tail - 1)
        if (tcol < gridSize - 1 && grid[tail + 1] === -1) tailCandidates.push(tail + 1)
        if (tailCandidates.length === 0) continue // both ends stuck
        paths[c].reverse() // swap head ↔ tail so we can push onto the new head
        candidates = tailCandidates
      }

      const next = candidates[Math.floor(rng() * candidates.length)]
      grid[next] = c
      paths[c].push(next)
      filled++
      anyMoved = true
    }

    if (!anyMoved) {
      totalStuckRounds++
      if (totalStuckRounds > numColors * 3) return null // genuinely stuck
    }
  }

  if (filled < total) return null

  // Reject any path with only 1 cell — that would make endpoint A === endpoint B
  if (paths.some(p => p.length < 2)) return null

  // Convert linear indices back to (row, col) endpoints
  return paths.map((path, color) => ({
    color,
    a: {
      row: Math.floor(path[0] / gridSize),
      col: path[0] % gridSize,
    },
    b: {
      row: Math.floor(path[path.length - 1] / gridSize),
      col: path[path.length - 1] % gridSize,
    },
  }))
}

/**
 * Guaranteed generator using a snake (boustrophedon) Hamiltonian path.
 * Unlike the growth-based tryGenerate, this ALWAYS succeeds for any
 * valid gridSize/numColors pair (total ≥ numColors × 2). The trade-off
 * is that every path follows the same underlying snake, making this
 * less visually varied — but a correct puzzle beats a 5×5 fallback.
 */
function guaranteedGenerate(gridSize: number, numColors: number, rng: () => number): Endpoint[] {
  const total = gridSize * gridSize

  // Pick one of 4 snake orientations so all levels don't look identical
  const orientation = Math.floor(rng() * 4)
  const snake: number[] = []

  if (orientation === 0) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        snake.push(row * gridSize + (row % 2 === 0 ? col : gridSize - 1 - col))
      }
    }
  } else if (orientation === 1) {
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        snake.push((col % 2 === 0 ? row : gridSize - 1 - row) * gridSize + col)
      }
    }
  } else if (orientation === 2) {
    for (let row = gridSize - 1; row >= 0; row--) {
      for (let col = 0; col < gridSize; col++) {
        const r = gridSize - 1 - row
        snake.push(row * gridSize + (r % 2 === 0 ? gridSize - 1 - col : col))
      }
    }
  } else {
    for (let col = gridSize - 1; col >= 0; col--) {
      for (let row = 0; row < gridSize; row++) {
        const c = gridSize - 1 - col
        snake.push((c % 2 === 0 ? row : gridSize - 1 - row) * gridSize + col)
      }
    }
  }

  // Start with 2 cells per segment (minimum for distinct endpoints),
  // then randomly distribute the remaining cells
  const segSizes: number[] = new Array(numColors).fill(2)
  const extra = total - numColors * 2
  for (let i = 0; i < extra; i++) segSizes[Math.floor(rng() * numColors)]++

  // Randomise which color owns which segment
  const colorOrder = Array.from({ length: numColors }, (_, i) => i)
  for (let i = colorOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [colorOrder[i], colorOrder[j]] = [colorOrder[j], colorOrder[i]]
  }

  const endpoints: Endpoint[] = new Array(numColors)
  let offset = 0
  for (let k = 0; k < numColors; k++) {
    const color = colorOrder[k]
    const startCell = snake[offset]
    const endCell = snake[offset + segSizes[k] - 1]
    endpoints[color] = {
      color,
      a: { row: Math.floor(startCell / gridSize), col: startCell % gridSize },
      b: { row: Math.floor(endCell / gridSize),   col: endCell % gridSize },
    }
    offset += segSizes[k]
  }
  return endpoints
}

export function generateLevel(levelNumber: number): LevelData {
  const params = getDifficultyParams(levelNumber)
  const { gridSize, numColors, seed } = params

  // Try up to 50 random seeds with the growth-based algorithm (best puzzle quality)
  for (let attempt = 0; attempt < 50; attempt++) {
    const rng = mulberry32((seed + attempt * 999983) >>> 0)
    const endpoints = tryGenerate(gridSize, numColors, rng)
    if (endpoints) return { levelNumber, gridSize, numColors, endpoints }
  }

  // Guaranteed fallback: boustrophedon always succeeds, preserves correct gridSize
  const rng = mulberry32((seed ^ 0xDEADBEEF) >>> 0)
  return { levelNumber, gridSize, numColors, endpoints: guaranteedGenerate(gridSize, numColors, rng) }
}
