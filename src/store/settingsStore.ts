import { create } from 'zustand'
import type { SettingsState } from '../types'
import { loadJSON, saveJSON } from '../utils/storage'
import { SETTINGS_KEY, STORAGE_VERSION } from '../constants/config'

const DEFAULT: SettingsState = {
  schemaVersion: STORAGE_VERSION,
  theme: 'dark',
  colorblindMode: 'none',
  soundEnabled: false,
  hapticEnabled: true,
  showTimer: true,
  showMoveCount: true,
}

interface SettingsStore extends SettingsState {
  update: (patch: Partial<SettingsState>) => void
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  ...loadJSON<SettingsState>(SETTINGS_KEY, DEFAULT, v =>
    typeof v['theme'] === 'string' &&
    typeof v['colorblindMode'] === 'string',
  ),

  update(patch) {
    set(s => {
      const next = { ...s, ...patch }
      saveJSON(SETTINGS_KEY, next)
      return next
    })
  },
}))
