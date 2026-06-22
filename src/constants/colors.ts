// Colorblind-safe palettes. Each has 12 entries (one per color slot).
export const PALETTES: Record<string, string[]> = {
  none: [
    '#E63946', // red
    '#2196F3', // blue
    '#4CAF50', // green
    '#FF9800', // orange
    '#9C27B0', // purple
    '#00BCD4', // cyan
    '#FFEB3B', // yellow
    '#795548', // brown
    '#607D8B', // blue-grey
    '#E91E63', // pink
    '#009688', // teal
    '#FF5722', // deep orange
  ],
  deuteranopia: [
    '#0072B2', '#E69F00', '#56B4E9', '#009E73',
    '#F0E442', '#CC79A7', '#D55E00', '#111111',
    '#888888', '#AAAAFF', '#FFAAAA', '#AAFFCC',
  ],
  protanopia: [
    '#0072B2', '#E69F00', '#56B4E9', '#F0E442',
    '#111111', '#888888', '#CC79A7', '#D55E00',
    '#009E73', '#AAAAFF', '#FFAAAA', '#AAFFCC',
  ],
  tritanopia: [
    '#E63946', '#2196F3', '#FF6B35', '#004E89',
    '#FF9F1C', '#1B4332', '#C77DFF', '#9D4EDD',
    '#480CA8', '#FFBA08', '#3A0CA3', '#F72585',
  ],
}

// Color names for accessibility labels
export const COLOR_NAMES = [
  'Red', 'Blue', 'Green', 'Orange',
  'Purple', 'Cyan', 'Yellow', 'Brown',
  'Steel', 'Pink', 'Teal', 'Coral',
]
