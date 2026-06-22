import { useProgressStore } from '../store/progressStore'
import { useUIStore } from '../store/uiStore'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/shared/Button'
import { LevelPicker } from '../components/menu/LevelPicker'
import { TOTAL_LEVELS } from '../constants/config'

export function MenuPage() {
  const highestUnlocked = useProgressStore(s => s.highestUnlocked)
  const completedCount = useProgressStore(s => Object.keys(s.completedLevels).length)
  const navigate = useUIStore(s => s.navigate)
  const loadLevel = useGameStore(s => s.loadLevel)

  function handleContinue() {
    const level = Math.min(highestUnlocked, TOTAL_LEVELS)
    loadLevel(level)
    navigate('game', level)
  }

  const pct = Math.round((completedCount / TOTAL_LEVELS) * 100)

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Flow Puzzle</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {completedCount}/{TOTAL_LEVELS} levels · {pct}%
          </p>
        </div>
        <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('howtoplay')}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-bg-secondary"
          aria-label="How to play"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <button
          onClick={() => navigate('settings')}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-bg-secondary"
          aria-label="Settings"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-bg-secondary rounded-full h-1.5" aria-hidden="true">
        <div
          className="bg-accent h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Continue button */}
      <Button size="lg" onClick={handleContinue} className="w-full">
        {completedCount === 0 ? 'Start Playing' : `Continue — Level ${Math.min(highestUnlocked, TOTAL_LEVELS)}`}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 text-text-secondary text-xs">
        <div className="flex-1 h-px bg-border" />
        <span>All Levels</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Level grid */}
      <LevelPicker />

      {/* Difficulty legend */}
      <div className="flex gap-4 text-xs text-text-secondary justify-center flex-wrap">
        {[
          { label: '1–1000', color: '#4CAF50' },
          { label: '1001–2500', color: '#2196F3' },
          { label: '2501–5000', color: '#FF9800' },
          { label: '5001–7500', color: '#9C27B0' },
          { label: '7501+', color: '#E63946' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
