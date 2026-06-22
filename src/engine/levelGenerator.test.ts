import { describe, it, expect } from 'vitest'
import { generateLevel } from './levelGenerator'

describe('levelGenerator', () => {
  it('level 1 produces 5×5 grid with 3 colors', () => {
    const level = generateLevel(1)
    expect(level.gridSize).toBe(5)
    expect(level.numColors).toBe(3)
    expect(level.endpoints).toHaveLength(3)
  })

  it('level 10000 produces 15×15 grid with 12 colors', () => {
    const level = generateLevel(10000)
    expect(level.gridSize).toBe(15)
    expect(level.numColors).toBe(12)
    expect(level.endpoints).toHaveLength(12)
  })

  it('same level always produces identical output (determinism)', () => {
    const a = generateLevel(500)
    const b = generateLevel(500)
    expect(a).toEqual(b)
  })

  it('different levels produce different puzzles', () => {
    const lvl1 = generateLevel(1)
    const lvl2 = generateLevel(2)
    expect(lvl1.endpoints).not.toEqual(lvl2.endpoints)
  })

  it('all endpoints stay within grid bounds', () => {
    for (const n of [1, 100, 1000, 5000, 9999, 10000]) {
      const level = generateLevel(n)
      for (const ep of level.endpoints) {
        expect(ep.a.row).toBeGreaterThanOrEqual(0)
        expect(ep.a.row).toBeLessThan(level.gridSize)
        expect(ep.a.col).toBeGreaterThanOrEqual(0)
        expect(ep.a.col).toBeLessThan(level.gridSize)
        expect(ep.b.row).toBeGreaterThanOrEqual(0)
        expect(ep.b.row).toBeLessThan(level.gridSize)
        expect(ep.b.col).toBeGreaterThanOrEqual(0)
        expect(ep.b.col).toBeLessThan(level.gridSize)
      }
    }
  })

  it('endpoints A and B are different cells (no degenerate levels)', () => {
    for (const n of [1, 50, 500, 5000, 10000]) {
      const level = generateLevel(n)
      for (const ep of level.endpoints) {
        expect(ep.a).not.toEqual(ep.b)
      }
    }
  })

  it('no two endpoints share the same cell', () => {
    for (const n of [1, 100, 1000, 10000]) {
      const level = generateLevel(n)
      const cells = new Set<string>()
      for (const ep of level.endpoints) {
        const ka = `${ep.a.row},${ep.a.col}`
        const kb = `${ep.b.row},${ep.b.col}`
        expect(cells.has(ka)).toBe(false)
        expect(cells.has(kb)).toBe(false)
        cells.add(ka)
        cells.add(kb)
      }
    }
  })

  it('level 10000 loads in under 200ms', () => {
    const t0 = performance.now()
    generateLevel(10000)
    const elapsed = performance.now() - t0
    expect(elapsed).toBeLessThan(200)
  })

  it('levels 1-20 all load without error', () => {
    for (let n = 1; n <= 20; n++) {
      const level = generateLevel(n)
      expect(level.endpoints.length).toBeGreaterThan(0)
    }
  })
})
