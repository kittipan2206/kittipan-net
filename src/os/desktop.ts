// Desktop icon grid: pure layout math (no React) so scripts/selfcheck.mts can test it.
export type Cell = { c: number; r: number };
export type Layout = Record<string, Cell>;
export interface Grid {
  cols: number;
  rows: number;
}

export const CELL_W = 92;
export const CELL_H = 96;
export const ORIGIN_X = 16;
export const ORIGIN_Y = 56;
const DOCK_RESERVE = 116;

export function gridFor(vw: number, vh: number): Grid {
  const right = vw >= 1280 ? 340 : 16; // keep clear of the widget column
  return {
    cols: Math.max(1, Math.floor((vw - ORIGIN_X - right) / CELL_W)),
    rows: Math.max(1, Math.floor((vh - ORIGIN_Y - DOCK_RESERVE) / CELL_H)),
  };
}

export const cellToPx = ({ c, r }: Cell) => ({ x: ORIGIN_X + c * CELL_W, y: ORIGIN_Y + r * CELL_H });

export const pxToCell = (x: number, y: number, grid: Grid): Cell => ({
  c: Math.min(grid.cols - 1, Math.max(0, Math.round((x - ORIGIN_X) / CELL_W))),
  r: Math.min(grid.rows - 1, Math.max(0, Math.round((y - ORIGIN_Y) / CELL_H))),
});

const key = ({ c, r }: Cell) => `${c},${r}`;

/** Closest free cell to `want` (by distance, then column-major), or `want` if the grid is full. */
export function nearestFree(want: Cell, taken: Set<string>, grid: Grid): Cell {
  let best: Cell | null = null;
  let bestD = Infinity;
  for (let c = 0; c < grid.cols; c++)
    for (let r = 0; r < grid.rows; r++) {
      if (taken.has(key({ c, r }))) continue;
      const d = (c - want.c) ** 2 + (r - want.r) ** 2;
      if (d < bestD) {
        bestD = d;
        best = { c, r };
      }
    }
  return best ?? want;
}

/** Apps fill the first column top-down (wrapping right); files stack down the rightmost column; trash sits bottom-right. */
export function defaultLayout(ids: string[], grid: Grid, trashId = "trash", isFile: (id: string) => boolean = () => false): Layout {
  const layout: Layout = {};
  const taken = new Set<string>();
  const place = (id: string, want: Cell) => {
    const cell = taken.has(key(want)) ? nearestFree(want, taken, grid) : want;
    layout[id] = cell;
    taken.add(key(cell));
  };
  const apps = ids.filter((id) => id !== trashId && !isFile(id));
  apps.forEach((id, i) => place(id, { c: Math.floor(i / grid.rows), r: i % grid.rows }));
  if (ids.includes(trashId)) place(trashId, { c: grid.cols - 1, r: grid.rows - 1 });
  ids.filter(isFile).forEach((id, i) => place(id, { c: grid.cols - 1, r: i }));
  return layout;
}

/** Fit a saved layout into the current grid: clamp, then resolve collisions; unknown ids get defaults. */
export function resolveLayout(saved: Layout, ids: string[], grid: Grid, isFile?: (id: string) => boolean): Layout {
  const fallback = defaultLayout(ids, grid, "trash", isFile);
  const out: Layout = {};
  const taken = new Set<string>();
  for (const id of ids) {
    const s = saved[id];
    const want = s ? { c: Math.min(s.c, grid.cols - 1), r: Math.min(s.r, grid.rows - 1) } : fallback[id];
    const cell = taken.has(key(want)) ? nearestFree(want, taken, grid) : want;
    out[id] = cell;
    taken.add(key(cell));
  }
  return out;
}

/** Move several icons by a cell delta; movers never land on each other or on still icons. */
export function moveIcons(layout: Layout, ids: string[], delta: Cell, grid: Grid): Layout {
  const out: Layout = { ...layout };
  const moving = new Set(ids);
  const taken = new Set(Object.entries(layout).filter(([id]) => !moving.has(id)).map(([, cell]) => key(cell)));
  for (const id of ids) {
    const from = layout[id];
    const want = {
      c: Math.min(grid.cols - 1, Math.max(0, from.c + delta.c)),
      r: Math.min(grid.rows - 1, Math.max(0, from.r + delta.r)),
    };
    const cell = taken.has(key(want)) ? nearestFree(want, taken, grid) : want;
    out[id] = cell;
    taken.add(key(cell));
  }
  return out;
}

/** Sort apps by name into the default flow, keeping trash where it is. */
export function sortLayout(layout: Layout, names: Record<string, string>, grid: Grid, trashId = "trash"): Layout {
  const ids = Object.keys(layout)
    .filter((id) => id !== trashId)
    .sort((a, b) => names[a].localeCompare(names[b]));
  const out: Layout = {};
  const taken = new Set<string>(layout[trashId] ? [key(layout[trashId])] : []);
  ids.forEach((id, i) => {
    const want = { c: Math.floor(i / grid.rows), r: i % grid.rows };
    const cell = taken.has(key(want)) ? nearestFree(want, taken, grid) : want;
    out[id] = cell;
    taken.add(key(cell));
  });
  if (layout[trashId]) out[trashId] = layout[trashId];
  return out;
}
