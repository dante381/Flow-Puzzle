import { create } from 'zustand'
import type { UIState, Page, ModalId } from '../types'

interface UIStore extends UIState {
  navigate: (page: Page, level?: number) => void
  setModal: (modal: ModalId) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  currentPage: 'menu',
  openModal: null,
  selectedLevel: null,

  navigate(page, level) {
    set({ currentPage: page, selectedLevel: level ?? null, openModal: null })
  },

  setModal(modal) {
    set({ openModal: modal })
  },
}))
