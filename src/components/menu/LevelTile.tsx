import { useProgressStore } from '../../store/progressStore'
import { useUIStore } from '../../store/uiStore'
import { useGameStore } from '../../store/gameStore'

interface Props {
  levelNumber: number
}

const DIFFICULTY_COLORS = [
  '#4CAF50', // 1–1000: easy green
  '#2196F3', // 1001–2500: blue
  '#FF9800', // 2501–5000: orange
  '#9C27B0', // 5001–7500: purple
  '#E63946', // 7501–10000: red
]

function getDifficultyColor(level: number): string {
  if (level <= 1000) return DIFFICULTY_COLORS[0]
  if (level <= 2500) return DIFFICULTY_COLORS[1]
  if (level <= 5000) return DIFFICULTY_COLORS[2]
  if (level <= 7500) return DIFFICULTY_COLORS[3]
  return DIFFICULTY_COLORS[4]
}

export function LevelTile({ levelNumber }: Props) {
  const result = useProgressStore(s => s.completedLevels[levelNumber])
  const highestUnlocked = useProgressStore(s => s.highestUnlocked)
  const navigate = useUIStore(s => s.navigate)
  const loadLevel = useGameStore(s => s.loadLevel)

  const isLocked = levelNumber > highestUnlocked
  const isComplete = result !== undefined
  const diffColor = getDifficultyColor(levelNumber)

  function handleClick() {
    if (isLocked) return
    loadLevel(levelNumber)
    navigate('game', levelNumber)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      aria-label={`Level ${levelNumber}${isComplete ? `, ${result.stars} stars` : ''}${isLocked ? ', locked' : ''}`}
      className="w-full h-full p-1 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 rounded-lg"
    >
      <div
        className={`relative w-full h-full rounded-lg flex flex-col items-center justify-center transition-all duration-150 ${
          isLocked
            ? 'bg-bg-secondary opacity-30 cursor-not-allowed'
            : isComplete
              ? 'bg-bg-card hover:brightness-110 cursor-pointer'
              : 'bg-bg-card hover:brightness-110 cursor-pointer'
        }`}
        style={{
          borderLeft: `3px solid ${isLocked ? 'transparent' : diffColor}`,
        }}
      >
        <span className="text-xs font-semibold text-text-primary">{levelNumber}</span>
        {isComplete && (
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3].map(i => (
              <svg
                key={i}
                width="6"
                height="6"
                viewBox="0 0 24 24"
                fill={i <= result.stars ? '#FFEB3B' : 'none'}
                stroke={i <= result.stars ? '#FFEB3B' : '#555'}
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        )}
        {isLocked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>
    </button>
  )
}
