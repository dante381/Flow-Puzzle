import type { GameState, Cell, ColorId, CellOccupancy, FlowPath } from '../types'
import { cellKey } from './levelGenerator'

function rebuildOccupancy(flows: FlowPath[]): CellOccupancy {
  const occ: CellOccupancy = new Map()
  for (const flow of flows) {
    for (const cell of flow.cells) {
      occ.set(cellKey(cell.row, cell.col), flow.color)
    }
  }
  return occ
}

function clearFlowFromCell(
  flows: FlowPath[],
  color: ColorId,
  cell: Cell,
): FlowPath[] {
  return flows.map(f => {
    if (f.color !== color) return f
    const idx = f.cells.findIndex(c => c.row === cell.row && c.col === cell.col)
    if (idx === -1) return f
    return { ...f, cells: f.cells.slice(0, idx), complete: false }
  })
}

function startFlow(state: GameState, color: ColorId, cell: Cell): Partial<GameState> {
  const newFlows = state.flows.map(f =>
    f.color === color ? { ...f, cells: [cell], complete: false } : f,
  )
  return {
    flows: newFlows,
    occupancy: rebuildOccupancy(newFlows),
    activeColor: color,
  }
}

function extendFlow(state: GameState, cell: Cell): Partial<GameState> {
  const { flows, activeColor, level, occupancy } = state
  if (activeColor === null) return {}

  const flow = flows.find(f => f.color === activeColor)
  if (!flow || flow.cells.length === 0) return {}

  const last = flow.cells[flow.cells.length - 1]
  const dr = Math.abs(cell.row - last.row)
  const dc = Math.abs(cell.col - last.col)
  // Must be exactly one step orthogonally
  if (dr + dc !== 1) return {}

  // Out of bounds guard
  if (cell.row < 0 || cell.row >= level.gridSize || cell.col < 0 || cell.col >= level.gridSize) return {}

  // Check if user is backtracking along their own path
  const backtrackIdx = flow.cells.findIndex(c => c.row === cell.row && c.col === cell.col)
  if (backtrackIdx !== -1) {
    const trimmed = flow.cells.slice(0, backtrackIdx + 1)
    const newFlows = flows.map(f =>
      f.color === activeColor ? { ...f, cells: trimmed, complete: false } : f,
    )
    return { flows: newFlows, occupancy: rebuildOccupancy(newFlows) }
  }

  // If cell is occupied by a different color, clear that color from this cell onward
  let currentFlows = flows
  const occupyingColor = occupancy.get(cellKey(cell.row, cell.col))
  if (occupyingColor !== undefined && occupyingColor !== activeColor) {
    currentFlows = clearFlowFromCell(flows, occupyingColor, cell)
  }

  // Determine if this cell is the endpoint for the active color
  const endpoint = level.endpoints.find(e => e.color === activeColor)
  if (!endpoint) return {}
  const targetA = cellKey(endpoint.a.row, endpoint.a.col)
  const targetB = cellKey(endpoint.b.row, endpoint.b.col)
  const thisCellKey = cellKey(cell.row, cell.col)

  // Is this cell either endpoint? (flow started at one, is heading to the other)
  const isOtherEndpoint =
    (thisCellKey === targetA || thisCellKey === targetB) &&
    cellKey(flow.cells[0].row, flow.cells[0].col) !== thisCellKey

  const newCells = [...flow.cells, cell]
  const newFlows = currentFlows.map(f =>
    f.color === activeColor
      ? { ...f, cells: newCells, complete: isOtherEndpoint }
      : f,
  )
  const newOccupancy = rebuildOccupancy(newFlows)
  const newActiveColor = isOtherEndpoint ? null : activeColor

  const allComplete = newFlows.every(f => f.complete)
  const allFilled = newOccupancy.size === level.gridSize * level.gridSize

  return {
    flows: newFlows,
    occupancy: newOccupancy,
    activeColor: newActiveColor,
    moveCount: state.moveCount + 1,
    isComplete: allComplete && allFilled,
  }
}

export function handleCellInteraction(state: GameState, cell: Cell): Partial<GameState> {
  const cellK = cellKey(cell.row, cell.col)

  // Check if cell is an endpoint
  const endpoint = state.level.endpoints.find(
    e =>
      cellKey(e.a.row, e.a.col) === cellK ||
      cellKey(e.b.row, e.b.col) === cellK,
  )

  if (state.activeColor === null) {
    // Start a new flow only from an endpoint
    if (endpoint !== undefined) {
      return startFlow(state, endpoint.color, cell)
    }
    return {}
  }

  // Already drawing — if user taps a different color's endpoint, switch to that color
  if (endpoint !== undefined && endpoint.color !== state.activeColor) {
    return startFlow(state, endpoint.color, cell)
  }

  return extendFlow(state, cell)
}
