// Snake on the LCD dot grid. Pure game logic so it can be tested without a browser.
export type Dir = "up" | "down" | "left" | "right";
export type Cell = [number, number];

export interface Game {
  w: number;
  h: number;
  snake: Cell[]; // head first
  dir: Dir;
  queued: Dir;
  food: Cell;
  alive: boolean;
  score: number;
}

const DELTA: Record<Dir, Cell> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

export function placeFood(w: number, h: number, snake: Cell[], rand: () => number): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!snake.some(([sx, sy]) => sx === x && sy === y)) free.push([x, y]);
  return free[Math.floor(rand() * free.length)] ?? [0, 0];
}

export function newGame(w: number, h: number, rand: () => number = Math.random): Game {
  const y = Math.floor(h / 2);
  const snake: Cell[] = [
    [4, y],
    [3, y],
    [2, y],
  ];
  return { w, h, snake, dir: "right", queued: "right", food: placeFood(w, h, snake, rand), alive: true, score: 0 };
}

/** Queue a turn; reversing into yourself is ignored. */
export function turn(game: Game, dir: Dir): Game {
  return dir === OPPOSITE[game.dir] ? game : { ...game, queued: dir };
}

export function step(game: Game, rand: () => number = Math.random): Game {
  if (!game.alive) return game;
  const dir = game.queued;
  const [dx, dy] = DELTA[dir];
  const [hx, hy] = game.snake[0];
  const head: Cell = [hx + dx, hy + dy];
  const eats = head[0] === game.food[0] && head[1] === game.food[1];
  const body = eats ? game.snake : game.snake.slice(0, -1);
  const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= game.w || head[1] >= game.h;
  const hitSelf = body.some(([x, y]) => x === head[0] && y === head[1]);
  if (hitWall || hitSelf) return { ...game, dir, alive: false };
  const snake = [head, ...body];
  return {
    ...game,
    dir,
    snake,
    food: eats ? placeFood(game.w, game.h, snake, rand) : game.food,
    score: eats ? game.score + 1 : game.score,
  };
}

/** Tick length in ms: speeds up as the snake grows, capped. */
export const tickMs = (score: number) => Math.max(70, 150 - score * 4);
