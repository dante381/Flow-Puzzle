import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function GameHUD() {
  const state = useGameStore(s => s.state)
  const navigate = useUIStore(s => s.navigate)
  const togglePause = useGameStore(s => s.togglePause)
  const resetLevel = useGameStore(s => s.resetLevel)
  const showTimer = useSettingsStore(s => s.showTimer)
  const showMoveCount = useSettingsStore(s => s.showMoveCount)

  if (!state) return null

  const { level, moveCount, elapsedSeconds, flows, occupancy } = state
  const filledCells = occupancy.size
  const totalCells = level.gridSize * level.gridSize
  const fillPct = Math.round((filledCells / totalCells) * 100)
  const completedFlows = flows.filter(f => f.complete).length

  return (
    <div className="flex items-center justify-between gap-2 py-3 px-1">
      {/* Back button */}
      <button
        onClick={() => navigate('menu')}
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-bg-secondary"
        aria-label="Back to menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="text-sm font-medium">Level {level.levelNumber}</span>
      </button>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        {showMoveCount && (
          <span aria-label={`${moveCount} moves`}>{moveCount} moves</span>
        )}
        {showTimer && (
          <span aria-label={`Time: ${formatTime(elapsedSeconds)}`}>{formatTime(elapsedSeconds)}</span>
        )}
        <span aria-label={`${fillPct} percent filled`} className={fillPct === 100 ? 'text-success font-semibold' : ''}>
          {fillPct}%
        </span>
        <span className="text-text-secondary/60" aria-label={`${completedFlows} of ${level.numColors} flows`}>
          {completedFlows}/{level.numColors}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={resetLevel}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          aria-label="Restart level"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
          </svg>
        </button>
        <button
          onClick={togglePause}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          aria-label={state.isPaused ? 'Resume' : 'Pause'}
        >
          {state.isPaused ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
