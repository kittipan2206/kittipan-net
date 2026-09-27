"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { appById } from "./apps";
import { useOS, type Win } from "./state";

const MENU_H = 36;
const DOCK_CLEARANCE = 96;
const MIN_W = 360;
const MIN_H = 240;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

// Invisible grab zones on every edge and corner, like a real window manager.
const HANDLES: { edge: Edge; className: string }[] = [
  { edge: "n", className: "inset-x-2 -top-1 h-2 cursor-ns-resize" },
  { edge: "s", className: "inset-x-2 -bottom-1 h-2 cursor-ns-resize" },
  { edge: "e", className: "inset-y-2 -right-1 w-2 cursor-ew-resize" },
  { edge: "w", className: "inset-y-2 -left-1 w-2 cursor-ew-resize" },
  { edge: "nw", className: "-left-1 -top-1 size-3 cursor-nwse-resize" },
  { edge: "se", className: "-bottom-1 -right-1 size-3 cursor-nwse-resize" },
  { edge: "ne", className: "-right-1 -top-1 size-3 cursor-nesw-resize" },
  { edge: "sw", className: "-bottom-1 -left-1 size-3 cursor-nesw-resize" },
];

type Gesture = { kind: "move" } | { kind: "resize"; edge: Edge };

export function Window({
  win,
  focused,
  children,
}: {
  win: Win;
  focused: boolean;
  children: ReactNode;
}) {
  const { dispatch, close } = useOS();
  const app = appById(win.id);
  const gesture = useRef<{
    g: Gesture;
    px: number;
    py: number;
    start: Win;
  } | null>(null);

  const begin = (g: Gesture) => (e: PointerEvent<HTMLElement>) => {
    if (
      win.maximized ||
      e.button !== 0 ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    e.stopPropagation();
    gesture.current = { g, px: e.clientX, py: e.clientY, start: win };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const track = (e: PointerEvent<HTMLElement>) => {
    const cur = gesture.current;
    if (!cur) return;
    const dx = e.clientX - cur.px;
    const dy = e.clientY - cur.py;
    const s = cur.start;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (cur.g.kind === "move") {
      const x = Math.min(Math.max(s.x + dx, 80 - s.w), vw - 80);
      const y = Math.min(Math.max(s.y + dy, MENU_H + 4), vh - 60);
      dispatch({ type: "move", id: win.id, x, y });
      return;
    }

    const { edge } = cur.g;
    let { x, y, w, h } = s;
    if (edge.includes("e"))
      w = Math.min(Math.max(s.w + dx, MIN_W), vw - s.x - 8);
    if (edge.includes("s"))
      h = Math.min(Math.max(s.h + dy, MIN_H), vh - s.y - 8);
    if (edge.includes("w")) {
      w = Math.min(Math.max(s.w - dx, MIN_W), s.x + s.w - 8);
      x = s.x + s.w - w;
    }
    if (edge.includes("n")) {
      h = Math.min(Math.max(s.h - dy, MIN_H), s.y + s.h - MENU_H - 4);
      y = s.y + s.h - h;
    }
    dispatch({ type: "frame", id: win.id, x, y, w, h });
  };

  const end = () => (gesture.current = null);

  const frame = win.maximized
    ? {
        left: 12,
        top: MENU_H + 12,
        width: "calc(100vw - 24px)",
        height: `calc(100vh - ${MENU_H + 12 + DOCK_CLEARANCE}px)`,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <motion.section
      aria-label={app.file}
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 6 }}
      transition={{ duration: 0.14, ease: [0.2, 0.7, 0.2, 1] }}
      onPointerDownCapture={() => dispatch({ type: "focus", id: win.id })}
      style={{ ...frame, zIndex: 10 + win.z }}
      className="absolute flex flex-col rounded-md border border-frame bg-panel shadow-window"
    >
      <div
        onPointerDown={begin({ kind: "move" })}
        onPointerMove={track}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={() => dispatch({ type: "toggleMax", id: win.id })}
        className={clsx(
          "flex h-9 shrink-0 cursor-grab touch-none select-none items-center justify-between rounded-t-md border-b border-line px-3 font-mono text-xs active:cursor-grabbing",
          win.id === "terminal" ? "bg-[#161614] text-[#edebe5]" : "text-ink",
        )}
      >
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label={`Close ${app.title}`}
            onClick={() => {
              sound.playMechanicalClick();
              close(win.id);
            }}
            className="size-[13px] rounded-[2px] border border-frame bg-accent hover:brightness-110"
          />
          <button
            type="button"
            aria-label={`Minimize ${app.title}`}
            onClick={() => {
              sound.playMechanicalClick();
              dispatch({ type: "minimize", id: win.id });
            }}
            className="size-[13px] rounded-[2px] border border-[#8c897f] hover:bg-[#8c897f]/30"
          />
          <button
            type="button"
            aria-label={
              win.maximized ? `Restore ${app.title}` : `Maximize ${app.title}`
            }
            onClick={() => {
              sound.playMechanicalClick();
              dispatch({ type: "toggleMax", id: win.id });
            }}
            className="size-[13px] rounded-[2px] border border-[#8c897f] hover:bg-[#8c897f]/30"
          />
        </div>
        <span
          className={clsx(
            "font-semibold tracking-[0.04em]",
            !focused && "opacity-60",
          )}
        >
          {app.file}
        </span>
        <span className="w-[51px] text-right text-[11px] opacity-50">
          {app.ownerOnly ? "private" : ""}
        </span>
      </div>
      <div
        className={clsx(
          "scroll-quiet min-h-0 grow rounded-b-md",
          win.id === "terminal" ? "overflow-hidden" : "overflow-y-auto",
          !focused && "saturate-[.85]",
        )}
      >
        {children}
      </div>
      {!win.maximized &&
        HANDLES.map(({ edge, className }) => (
          <div
            key={edge}
            aria-hidden
            onPointerDown={begin({ kind: "resize", edge })}
            onPointerMove={track}
            onPointerUp={end}
            onPointerCancel={end}
            className={clsx("absolute z-10 touch-none", className)}
          />
        ))}
    </motion.section>
  );
}
