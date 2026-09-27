"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { sound } from "@/lib/sound";
import { newGame, step, tickMs, turn, type Dir, type Game } from "../snake";
import { Caps, Key } from "../ui";

const W = 24;
const H = 16;
const HI_KEY = "kos_snake_hi";
const KEYS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function Snake() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const game = useRef<Game>(newGame(W, H));
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "over">(
    "ready",
  );
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);

  useEffect(() => {
    try {
      setHi(Number(localStorage.getItem(HI_KEY)) || 0);
    } catch {}
    box.current?.focus();
  }, []);

  // Every dot of the grid is drawn: lit for snake/food, ghost-dim for the rest, like an LED matrix.
  const draw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const cell = c.width / W;
    const ink = css("--lcd-ink") || "#ff6a1f";
    ctx.fillStyle = "#1b1c18";
    ctx.fillRect(0, 0, c.width, c.height);
    const g = game.current;
    const lit = new Set(g.snake.map(([x, y]) => `${x},${y}`));
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const on = lit.has(`${x},${y}`);
        const food = g.food[0] === x && g.food[1] === y;
        ctx.globalAlpha = on ? 1 : food ? 0.95 : 0.07;
        ctx.fillStyle = food ? "#edebe5" : ink;
        const pad = cell * 0.14;
        ctx.fillRect(
          x * cell + pad,
          y * cell + pad,
          cell - pad * 2,
          cell - pad * 2,
        );
      }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    draw();
    if (status !== "playing") return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const before = game.current.score;
      game.current = step(game.current);
      const g = game.current;
      draw();
      if (!g.alive) {
        sound.playToggleClick(false);
        setStatus("over");
        setHi((h) => {
          const next = Math.max(h, g.score);
          try {
            localStorage.setItem(HI_KEY, String(next));
          } catch {}
          return next;
        });
        return;
      }
      if (g.score !== before) {
        sound.playMechanicalClick();
        setScore(g.score);
      }
      timer = setTimeout(tick, tickMs(g.score));
    };
    timer = setTimeout(tick, tickMs(game.current.score));
    return () => clearTimeout(timer);
  }, [status, draw]);

  const start = () => {
    if (status === "over" || status === "ready") {
      game.current = newGame(W, H);
      setScore(0);
    }
    setStatus("playing");
  };

  const steer = (dir: Dir) => {
    if (status !== "playing") start();
    game.current = turn(game.current, dir);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const dir = KEYS[e.key];
    if (dir) {
      e.preventDefault();
      steer(dir);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (status === "playing") setStatus("paused");
      else start();
    }
  };

  const onPointerDown = (e: PointerEvent) =>
    (swipe.current = { x: e.clientX, y: e.clientY });
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
      if (status !== "playing") start();
      return;
    }
    steer(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up",
    );
  };

  const label = {
    ready: "",
    playing: "",
    paused: "PAUSED",
    over: "GAME OVER",
  }[status];

  return (
    <div
      ref={box}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Snake game. Arrow keys or WASD to steer, space to start or pause."
      className="flex h-full flex-col gap-3 p-4 outline-none"
    >
      <div className="flex items-center justify-between font-mono text-xs text-sub">
        <Caps>
          Score{" "}
          <span className="text-ink">{String(score).padStart(3, "0")}</span>
        </Caps>
        <Caps>
          Hi <span className="text-ink">{String(hi).padStart(3, "0")}</span>
        </Caps>
      </div>
      <div
        className="lcd relative p-2"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvas}
          width={W * 20}
          height={H * 20}
          className="block w-full [image-rendering:pixelated]"
        />
        {status === "ready" && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center bg-black/40 font-dot text-[28px] font-extrabold tracking-wide text-lcd-ink sm:text-[34px]"
          >
            <span className="md:hidden">TAP TO PLAY</span>
            <span className="hidden md:inline">PRESS SPACE</span>
          </button>
        )}
        {label && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 flex items-center justify-center bg-black/40 font-dot text-[28px] font-extrabold tracking-wide text-lcd-ink sm:text-[34px]"
          >
            {label}
          </button>
        )}
      </div>
      <div
        className="grid grid-cols-3 gap-2 self-center md:hidden"
        aria-label="Controls"
      >
        <span />
        <Key
          aria-label="Up"
          onClick={() => steer("up")}
          className="flex size-14 items-center justify-center"
        >
          <ChevronUp aria-hidden />
        </Key>
        <span />
        <Key
          aria-label="Left"
          onClick={() => steer("left")}
          className="flex size-14 items-center justify-center"
        >
          <ChevronLeft aria-hidden />
        </Key>
        <Key
          aria-label="Down"
          onClick={() => steer("down")}
          className="flex size-14 items-center justify-center"
        >
          <ChevronDown aria-hidden />
        </Key>
        <Key
          aria-label="Right"
          onClick={() => steer("right")}
          className="flex size-14 items-center justify-center"
        >
          <ChevronRight aria-hidden />
        </Key>
      </div>
      <Caps className="hidden text-center md:block">
        arrows / wasd · space to pause
      </Caps>
    </div>
  );
}
