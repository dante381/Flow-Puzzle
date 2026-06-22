import { create } from 'zustand'
import type { GameState, LevelData, Cell } from '../types'
import { generateLevel } from '../engine/levelGenerator'
import { handleCellInteraction } from '../engine/gameEngine'

interface GameStore {
  state: GameState | null
  loadLevel: (levelNumber: number) => void
  interactCell: (cell: Cell) => void
  stopDraw: () => void
  resetLevel: () => void
  tick: () => void
  togglePause: () => void
}

function makeInitialState(level: LevelData): GameState {
  return {
    level,
    flows: level.endpoints.map(ep => ({ color: ep.color, cells: [], complete: false })),
    occupancy: new Map(),
    activeColor: null,
    moveCount: 0,
    elapsedSeconds: 0,
    isComplete: false,
    isPaused: false,
  }
}

export const useGameStore = create<GameStore>()((set, get) => ({
  state: null,

  loadLevel(levelNumber) {
    const level = generateLevel(levelNumber)
    set({ state: makeInitialState(level) })
  },

  interactCell(cell) {
    const { state } = get()
    if (!state || state.isComplete || state.isPaused) return
    const patch = handleCellInteraction(state, cell)
    if (Object.keys(patch).length > 0) {
      set({ state: { ...state, ...patch } })
    }
  },

  stopDraw() {
    const { state } = get()
    if (!state || state.activeColor === null) return
    set({ state: { ...state, activeColor: null } })
  },

  resetLevel() {
    const { state } = get()
    if (!state) return
    set({ state: makeInitialState(state.level) })
  },

  tick() {
    const { state } = get()
    if (!state || state.isPaused || state.isComplete) return
    set({ state: { ...state, elapsedSeconds: state.elapsedSeconds + 1 } })
  },

  togglePause() {
    const { state } = get()
    if (!state) return
    set({ state: { ...state, isPaused: !state.isPaused } })
  },
}))
