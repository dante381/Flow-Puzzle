import { useUIStore } from '../store/uiStore'
import { Button } from '../components/shared/Button'

const S = 40  // cell size in px
const P = 4   // padding
const GRID_SIZE = 4 * S + 2 * P

const cx = (col: number) => col * S + S / 2 + P
const cy = (row: number) => row * S + S / 2 + P

// A valid 4×4 demo: red fills the border path, blue fills bottom-left, green fills center
const DEMO_PATHS = [
  { color: '#E63946', cells: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3]] as [number,number][] },
  { color: '#2196F3', cells: [[1,0],[2,0],[3,0],[3,1],[3,2]] as [number,number][] },
  { color: '#4CAF50', cells: [[1,1],[1,2],[2,2],[2,1]] as [number,number][] },
]

function DemoGrid({ solved }: { solved: boolean }) {
  return (
    <svg
      width={GRID_SIZE}
      height={GRID_SIZE}
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      style={{ borderRadius: 8, background: 'var(--color-bg-card)' }}
    >
      {/* Grid lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <line x1={P} y1={i * S + P} x2={4 * S + P} y2={i * S + P} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1={i * S + P} y1={P} x2={i * S + P} y2={4 * S + P} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </g>
      ))}

      {/* Pipes — only in solved state */}
      {solved && DEMO_PATHS.map(({ color, cells }, pi) => {
        const d = cells.map(([r, c], i) => `${i === 0 ? 'M' : 'L'}${cx(c)},${cy(r)}`).join(' ')
        return (
          <path
            key={pi}
            d={d}
            stroke={color}
            strokeWidth={S * 0.52}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )
      })}

      {/* Endpoint dots */}
      {DEMO_PATHS.map(({ color, cells }, pi) =>
        [cells[0], cells[cells.length - 1]].map(([r, c], j) => (
          <circle
            key={`${pi}-${j}`}
            cx={cx(c)}
            cy={cy(r)}
            r={S * 0.34}
            fill={color}
          />
        ))
      )}
    </svg>
  )
}

export function HowToPlayPage() {
  const navigate = useUIStore(s => s.navigate)

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('menu')}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          aria-label="Back to menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">How to Play</h1>
      </div>

      {/* Before / After demo */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <DemoGrid solved={false} />
          <span className="text-xs text-text-secondary">Puzzle</span>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="flex flex-col items-center gap-2">
          <DemoGrid solved={true} />
          <span className="text-xs text-text-secondary">Solved!</span>
        </div>
      </div>

      {/* Core rules */}
      <div className="flex flex-col gap-3">
        {[
          {
            emoji: '🔴',
            title: 'Connect matching dots',
            body: 'Drag from a colored dot to its matching dot of the same color.',
          },
          {
            emoji: '⬛',
            title: 'Fill every cell',
            body: 'The puzzle is only solved when every cell on the grid is covered by a pipe. No empty spaces.',
          },
          {
            emoji: '↩',
            title: 'Backtrack to erase',
            body: "Drag back over your own path to erase that portion. Crossing another color's pipe clears it from that point.",
          },
          {
            emoji: '↕',
            title: 'Pipes cannot cross',
            body: 'Each cell can only hold one pipe. Plan your routes to avoid dead ends.',
          },
        ].map(({ emoji, title, body }) => (
          <div key={title} className="flex gap-4 items-start bg-bg-card rounded-xl p-4">
            <span className="text-xl leading-tight mt-0.5" style={{ flexShrink: 0 }}>{emoji}</span>
            <div>
              <div className="text-text-primary font-semibold text-sm mb-1">{title}</div>
              <div className="text-text-secondary text-sm leading-relaxed">{body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Star rating */}
      <div className="bg-bg-card rounded-xl p-4">
        <div className="text-text-primary font-semibold text-sm mb-3">Star rating</div>
        <div className="flex flex-col gap-2.5">
          {[
            { stars: 3, label: 'Perfect', desc: 'Moves ≤ number of cells' },
            { stars: 2, label: 'Great',   desc: 'Moves ≤ 1.5× cells' },
            { stars: 1, label: 'Solved',  desc: 'Any number of moves' },
          ].map(({ stars, label, desc }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5 w-16">
                {[1, 2, 3].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                    fill={i <= stars ? '#FFEB3B' : 'none'}
                    stroke={i <= stars ? '#FFEB3B' : '#555'}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-text-primary font-medium w-14">{label}</span>
              <span className="text-text-secondary">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-bg-card rounded-xl p-4">
        <div className="text-text-primary font-semibold text-sm mb-3">Strategy tips</div>
        <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
          {[
            'Start with colors that have the fewest possible routes',
            'Long winding paths are usually filled last — they\'re flexible',
            'If you\'re stuck, clear a path and reroute a different color first',
            'Keyboard: Tab to focus, arrow keys to move, Space/Enter to draw',
          ].map(tip => (
            <li key={tip} className="flex gap-2 items-start">
              <span className="text-accent mt-0.5 leading-none">›</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button size="lg" onClick={() => navigate('menu')} className="w-full">
        Got it — Let's Play!
      </Button>
    </div>
  )
}
