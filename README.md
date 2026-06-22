# Flow Puzzle

A browser-based puzzle game inspired by Flow Free. Connect same-colored dots with pipes to fill every cell on the grid.

**Play:** https://dante381.github.io/Flow-Puzzle/

![Flow Puzzle](https://dante381.github.io/Flow-Puzzle/preview.png)

## How to Play

- Drag from a colored dot to its matching dot
- Every cell must be covered — no empty spaces
- Drag back over your path to erase it
- Pipes cannot cross

## Features

- 10,000 procedurally generated levels (fully deterministic — same seed = same puzzle)
- Smooth drag-to-draw with live pointer preview
- Star rating based on move efficiency
- Progress saved automatically via localStorage
- Colorblind modes (deuteranopia, protanopia, tritanopia)
- Dark / light / system theme
- Keyboard accessible (Tab + arrow keys + Space/Enter)
- Single self-contained HTML file — no server needed

## Difficulty Curve

| Levels | Grid | Colors |
|--------|------|--------|
| 1–1000 | 5×5 → 8×8 | 3–6 |
| 1001–2500 | 8×8 → 10×10 | 6–8 |
| 2501–5000 | 10×10 → 12×12 | 8–10 |
| 5001–7500 | 12×12 → 14×14 | 10–11 |
| 7501–10000 | 14×14 → 15×15 | 11–12 |

## Stack

- Vite 6 + React 19 + TypeScript 5
- Tailwind CSS v4
- Zustand 5
- Canvas 2D (RAF-based rendering)
- `vite-plugin-singlefile` → single `index.html` (246 KB / 75 KB gzip)

## Development

```bash
npm install
npm run dev       # dev server at localhost:5173
npm run build     # production build → dist/index.html
npm run test      # unit tests (Vitest)
npm run preview   # preview build at localhost:4173
```

## License

MIT
