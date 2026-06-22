import type { GameState, Cell } from '../../types'
import { cellKey } from '../../engine/levelGenerator'
import { COLOR_NAMES } from '../../constants/colors'

interface Props {
  state: GameState
  onCellActivate: (cell: Cell) => void
}

export function A11yOverlay({ state, onCellActivate }: Props) {
  const { gridSize } = state.level

  return (
    <div
      role="grid"
      aria-label={`Flow puzzle grid, ${gridSize} by ${gridSize}`}
      className="absolute inset-0"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: gridSize }, (_, row) => (
        // role="row" required by ARIA spec for gridcell elements
        <div key={row} role="row" aria-rowindex={row + 1} style={{ display: 'contents' }}>
          {Array.from({ length: gridSize }, (_, col) => {
            const k = cellKey(row, col)
            const occupyingColor = state.occupancy.get(k)
            const ep = state.level.endpoints.find(
              e =>
                cellKey(e.a.row, e.a.col) === k ||
                cellKey(e.b.row, e.b.col) === k,
            )

            const colorName =
              ep !== undefined
                ? (COLOR_NAMES[ep.color] ?? `Color ${ep.color}`)
                : occupyingColor !== undefined
                  ? (COLOR_NAMES[occupyingColor] ?? `Color ${occupyingColor}`)
                  : null

            const label = ep
              ? `Row ${row + 1}, Column ${col + 1}. ${colorName} endpoint.`
              : occupyingColor !== undefined
                ? `Row ${row + 1}, Column ${col + 1}. ${colorName} pipe.`
                : `Row ${row + 1}, Column ${col + 1}. Empty.`

            return (
              <button
                key={k}
                role="gridcell"
                aria-colindex={col + 1}
                aria-label={label}
                className="opacity-0 focus-visible:opacity-30 focus-visible:bg-white focus-visible:outline-none"
                style={{ cursor: 'default' }}
                onClick={() => onCellActivate({ row, col })}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
