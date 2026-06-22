import { create } from 'zustand'
import type { ProgressState, LevelResult } from '../types'
import { loadJSON, saveJSON } from '../utils/storage'
import { PROGRESS_KEY, STORAGE_VERSION } from '../constants/config'

const DEFAULT: ProgressState = {
  schemaVersion: STORAGE_VERSION,
  completedLevels: {},
  highestUnlocked: 1,
}

interface ProgressStore extends ProgressState {
  completeLevel: (level: number, result: LevelResult) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressStore>()((set, get) => ({
  ...loadJSON<ProgressState>(PROGRESS_KEY, DEFAULT, v =>
    typeof v['highestUnlocked'] === 'number' &&
    v['completedLevels'] !== null &&
    typeof v['completedLevels'] === 'object' &&
    !Array.isArray(v['completedLevels']),
  ),

  completeLevel(level, result) {
    const prev = get().completedLevels[level]
    // Keep best result (most stars, then fewest moves)
    if (prev && (prev.stars > result.stars || (prev.stars === result.stars && prev.moveCount <= result.moveCount))) return
    set(s => {
      const next: ProgressState = {
        ...s,
        completedLevels: { ...s.completedLevels, [level]: result },
        highestUnlocked: Math.max(s.highestUnlocked, level + 1),
      }
      saveJSON(PROGRESS_KEY, next)
      return next
    })
  },

  resetProgress() {
    localStorage.removeItem(PROGRESS_KEY)
    set({ ...DEFAULT })
  },
}))
