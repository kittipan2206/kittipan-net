"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, type TargetAndTransition, type Variants } from "framer-motion";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { appById, type AppId } from "./apps";
import { useOS, type Win } from "./state";

const MENU_H = 36;
const DOCK_CLEARANCE = 96;
const MIN_W = 360;
const MIN_H = 240;
const SNAP_EDGE = 6;
const EASE = [0.2, 0.7, 0.2, 1] as const;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Snap = "left" | "right" | "max" | null;

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

function snapFrame(snap: Exclude<Snap, "max" | null>) {
  const vw = window.innerWidth;
  const h = window.innerHeight - MENU_H - 8 - DOCK_CLEARANCE;
  const w = Math.round(vw / 2 - 12);
  return { x: snap === "left" ? 8 : vw - w - 8, y: MENU_H + 8, w, h };
}

// Where a window flies to when minimized: its key in the dock.
function dockPose(win: Win): TargetAndTransition {
  const key = document.querySelector(`[data-dock-key="${win.id}"]`);
  if (!key) return { opacity: 0, scale: 0.97, y: 6 };
  const r = key.getBoundingClientRect();
  const w = win.maximized ? window.innerWidth - 24 : win.w;
  const h = win.maximized
    ? window.innerHeight - MENU_H - 12 - DOCK_CLEARANCE
    : win.h;
  const left = win.maximized ? 12 : win.x;
  const top = win.maximized ? MENU_H + 12 : win.y;
  return {
    x: r.left + r.width / 2 - (left + w / 2),
    y: r.top + r.height / 2 - (top + h / 2),
    scale: 0.06,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.9, 0.6] as const },
  };
}

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
  const [snap, setSnap] = useState<Snap>(null);

  const variants: Variants = {
    hidden: () =>
      win.fromDock ? dockPose(win) : { opacity: 0, scale: 0.97, y: 6 },
    shown: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: { duration: win.fromDock ? 0.26 : 0.14, ease: EASE },
    },
    gone: (minimized: AppId[] | undefined) =>
      minimized?.includes(win.id)
        ? dockPose(win)
        : {
            opacity: 0,
            scale: 0.97,
            y: 6,
            transition: { duration: 0.14, ease: EASE },
          },
  };

  const begin = (g: Gesture) => (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    if (win.maximized && g.kind === "resize") return;
    e.stopPropagation();
    let start = win;
    // Dragging a maximized window restores it under the pointer, like every desktop OS.
    if (win.maximized) {
      start = {
        ...win,
        maximized: false,
        x: Math.round(e.clientX - win.w / 2),
        y: MENU_H + 4,
      };
      dispatch({
        type: "frame",
        id: win.id,
        x: start.x,
        y: start.y,
        w: win.w,
        h: win.h,
        maximized: false,
      });
    }
    gesture.current = { g, px: e.clientX, py: e.clientY, start };
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
      setSnap(
        e.clientX <= SNAP_EDGE
          ? "left"
          : e.clientX >= vw - SNAP_EDGE
            ? "right"
            : e.clientY <= MENU_H + 2
              ? "max"
              : null,
      );
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

  const end = () => {
    const cur = gesture.current;
    gesture.current = null;
    if (!cur || cur.g.kind !== "move" || !snap) return;
    sound.playToggleClick(true);
    if (snap === "max")
      dispatch({ type: "frame", id: win.id, x: cur.start.x, y: cur.start.y, w: cur.start.w, h: cur.start.h, maximized: true });
    else
      dispatch({
        type: "frame",
        id: win.id,
        ...snapFrame(snap),
        maximized: false,
      });
    setSnap(null);
  };

  const frame = win.maximized
    ? {
        left: 12,
        top: MENU_H + 12,
        width: "calc(100vw - 24px)",
        height: `calc(100vh - ${MENU_H + 12 + DOCK_CLEARANCE}px)`,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  const preview =
    snap === "max"
      ? { left: 12, top: MENU_H + 12, right: 12, bottom: DOCK_CLEARANCE }
      : snap
        ? (() => {
            const f = snapFrame(snap);
            return { left: f.x, top: f.y, width: f.w, height: f.h };
          })()
        : null;

  return (
    <>
      <motion.section
        aria-label={app.file}
        variants={variants}
        initial="hidden"
        animate="shown"
        exit="gone"
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
      {preview &&
        createPortal(
          <div
            aria-hidden
            style={{ ...preview, zIndex: 9 + win.z }}
            className="pointer-events-none fixed rounded-lg border-2 border-accent bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] transition-all duration-150"
          />,
          document.body,
        )}
    </>
  );
}
