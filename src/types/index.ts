export type ColorId = number // 0–11

export interface Cell {
  row: number
  col: number
}

export interface Endpoint {
  color: ColorId
  a: Cell
  b: Cell
}

export interface LevelData {
  levelNumber: number
  gridSize: number
  numColors: number
  endpoints: Endpoint[]
}

export interface FlowPath {
  color: ColorId
  cells: Cell[]
  complete: boolean
}

// key: `${row},${col}`, value: color id or undefined (empty)
export type CellOccupancy = Map<string, ColorId>

export interface GameState {
  level: LevelData
  flows: FlowPath[]
  occupancy: CellOccupancy
  activeColor: ColorId | null
  moveCount: number
  elapsedSeconds: number
  isComplete: boolean
  isPaused: boolean
}

export interface LevelResult {
  stars: 1 | 2 | 3
  moveCount: number
  timeSeconds: number
  solvedAt: number
}

export interface ProgressState {
  schemaVersion: number
  completedLevels: Record<number, LevelResult>
  highestUnlocked: number
}

export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
export type Theme = 'dark' | 'light' | 'system'

export interface SettingsState {
  schemaVersion: number
  theme: Theme
  colorblindMode: ColorblindMode
  soundEnabled: boolean
  hapticEnabled: boolean
  showTimer: boolean
  showMoveCount: boolean
}

export type Page = 'menu' | 'game' | 'settings' | 'howtoplay'
export type ModalId = 'levelComplete' | 'pause' | null

export interface UIState {
  currentPage: Page
  openModal: ModalId
  selectedLevel: number | null
}
