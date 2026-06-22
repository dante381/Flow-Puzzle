import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useProgressStore } from '../../store/progressStore'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { TOTAL_LEVELS } from '../../constants/config'

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-2 justify-center" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map(i => (
        <svg
          key={i}
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill={i <= count ? '#FFEB3B' : 'none'}
          stroke={i <= count ? '#FFEB3B' : '#555'}
          strokeWidth="1.5"
          className={i <= count ? '' : 'opacity-30'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export function LevelComplete() {
  const state = useGameStore(s => s.state)
  const loadLevel = useGameStore(s => s.loadLevel)
  const resetLevel = useGameStore(s => s.resetLevel)
  const navigate = useUIStore(s => s.navigate)
  const completedLevels = useProgressStore(s => s.completedLevels)

  if (!state?.isComplete) return null

  const levelNumber = state.level.levelNumber
  const totalCells = state.level.gridSize * state.level.gridSize
  // Compute stars from current solve — don't wait for async progress save
  const currentStars: 1 | 2 | 3 =
    state.moveCount <= totalCells ? 3
    : state.moveCount <= Math.round(totalCells * 1.5) ? 2
    : 1
  const priorStars = completedLevels[levelNumber]?.stars ?? 0
  const stars = Math.max(priorStars, currentStars) as 1 | 2 | 3
  const isLastLevel = levelNumber >= TOTAL_LEVELS

  function handleNext() {
    if (!isLastLevel) {
      loadLevel(levelNumber + 1)
    } else {
      navigate('menu')
    }
  }

  return (
    <Modal label="Level complete">
      <div className="flex flex-col items-center gap-5 text-center">
        <div>
          <div className="text-text-secondary text-sm mb-1">Level {levelNumber} complete!</div>
          <div className="text-2xl font-bold text-text-primary">
            {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great!' : 'Solved!'}
          </div>
        </div>

        <Stars count={stars} />

        <div className="flex gap-6 text-sm text-text-secondary">
          <div>
            <div className="text-text-primary font-semibold text-lg">{state.moveCount}</div>
            <div>moves</div>
          </div>
          <div>
            <div className="text-text-primary font-semibold text-lg">
              {Math.floor(state.elapsedSeconds / 60)}:{String(state.elapsedSeconds % 60).padStart(2, '0')}
            </div>
            <div>time</div>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={resetLevel} className="flex-1" aria-label="Retry this level">
            Retry
          </Button>
          <Button size="md" onClick={handleNext} className="flex-1" aria-label={isLastLevel ? 'Back to menu' : 'Next level'}>
            {isLastLevel ? 'Menu' : 'Next →'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
