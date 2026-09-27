"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Trash, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { APPS, appById, type AppId } from "./apps";
import { useOS } from "./state";
import {
  cellToPx,
  defaultLayout,
  gridFor,
  moveIcons,
  pxToCell,
  resolveLayout,
  sortLayout,
  type Grid,
  type Layout,
} from "./desktop";

const TRASH = "trash";
const ICON_IDS = [...APPS.filter((a) => !a.hidden).map((a) => a.id as string), TRASH];
const NAMES = Object.fromEntries(ICON_IDS.map((id) => [id, id === TRASH ? "Trash" : appById(id as AppId).title]));
const STORE = "kos_icons";
const ICON_W = 88;
const ICON_H = 84;

const QUIPS: Record<string, string> = {
  about: "about.app is load-bearing. It came back.",
  contact: "Deleting Contact? Then how would you reach me.",
  terminal: "terminal: rm: permission denied.",
  settings: "Settings restored. They were fine the way they were.",
  projects: "Projects can't be deleted — only shipped.",
  launchpad: "launchpad is owner-only. Even in the trash.",
};

type Drag = { ids: string[]; primary: string; dx: number; dy: number; tilt: number; overTrash: boolean };
type Gesture = { ids: string[]; primary: string; px: number; py: number; lastX: number; moved: boolean };
type Rect = { x0: number; y0: number; x1: number; y1: number };

const readSaved = (): Layout => {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}");
  } catch {
    return {};
  }
};

/** Desktop icons you can arrange: drag, marquee-select, snap to grid, and a trash that refuses to keep anything. */
export function DesktopIcons() {
  const { open, notify, dispatch } = useOS();
  const [grid, setGrid] = useState<Grid | null>(null);
  const [saved, setSaved] = useState<Layout>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [trashed, setTrashed] = useState<{ ids: string[]; phase: "in" | "out" } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const marqueeStart = useRef<{ x: number; y: number; base: Set<string> } | null>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(readSaved());
    const fit = () => setGrid(gridFor(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const layout = useMemo(() => (grid ? resolveLayout(saved, ICON_IDS, grid) : null), [saved, grid]);

  const commit = useCallback((next: Layout) => {
    setSaved(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  }, []);

  // Right-click menu → "Clean up" / "Sort by name".
  useEffect(() => {
    const onIcons = (e: Event) => {
      if (!grid || !layout) return;
      const action = (e as CustomEvent<string>).detail;
      commit(action === "sort" ? sortLayout(layout, NAMES, grid) : defaultLayout(ICON_IDS, grid));
      sound.playToggleClick(true);
    };
    window.addEventListener("kos:icons", onIcons);
    return () => window.removeEventListener("kos:icons", onIcons);
  }, [grid, layout, commit]);

  const openIcon = (id: string) => {
    sound.playMechanicalClick();
    open(id as AppId);
  };

  const throwAway = (ids: string[]) => {
    const apps = ids.filter((id) => id !== TRASH);
    if (apps.length === 0 || trashed) return;
    setDrag(null);
    setTrashed({ ids: apps, phase: "in" });
    setTimeout(() => sound.playCrunch(), 220);
    setTimeout(() => {
      setTrashed({ ids: apps, phase: "out" });
      sound.playPop();
      dispatch({ type: "trashed", ids: apps as AppId[] });
      notify(apps.length === 1 ? (QUIPS[apps[0]] ?? `${apps[0]} is a system file. Nice try.`) : `Nice try. ${apps.length} apps respawned.`);
    }, 1000);
    setTimeout(() => setTrashed(null), 1700);
  };

  const trashRect = () => {
    if (!layout) return null;
    const { x, y } = cellToPx(layout[TRASH]);
    return { x0: x - 14, y0: y - 14, x1: x + ICON_W + 14, y1: y + ICON_H + 14 };
  };

  // ── Icon pointer handling ────────────────────────────────
  const onIconDown = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !layout) return;
    e.stopPropagation();
    const additive = e.metaKey || e.ctrlKey || e.shiftKey;
    let next = new Set(selected);
    if (additive) next.has(id) ? next.delete(id) : next.add(id);
    else if (!next.has(id)) next = new Set([id]);
    setSelected(next);
    const ids = next.has(id) ? [...next] : [id];
    gesture.current = { ids, primary: id, px: e.clientX, py: e.clientY, lastX: e.clientX, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onIconMove = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.px;
    const dy = e.clientY - g.py;
    if (!g.moved && Math.hypot(dx, dy) < 5) return;
    g.moved = true;
    const vx = e.clientX - g.lastX;
    g.lastX = e.clientX;
    const t = trashRect();
    const overTrash =
      !!t && !g.ids.includes(TRASH) && e.clientX >= t.x0 && e.clientX <= t.x1 && e.clientY >= t.y0 && e.clientY <= t.y1;
    setDrag((prev) => ({
      ids: g.ids,
      primary: g.primary,
      dx,
      dy,
      tilt: Math.max(-9, Math.min(9, (prev?.tilt ?? 0) * 0.7 + vx * 0.6)),
      overTrash,
    }));
  };

  const onIconUp = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.moved || !drag || !layout || !grid) {
      setDrag(null);
      return;
    }
    if (drag.overTrash) {
      throwAway(g.ids);
      return;
    }
    const from = layout[g.primary];
    const { x, y } = cellToPx(from);
    const to = pxToCell(x + drag.dx, y + drag.dy, grid);
    commit(moveIcons(layout, g.ids, { c: to.c - from.c, r: to.r - from.r }, grid));
    sound.playMechanicalClick();
    setDrag(null);
  };

  const onIconKey = (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter") openIcon(id);
    else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      throwAway(selected.size ? [...selected] : [id]);
    }
  };

  // ── Marquee selection on empty desktop ───────────────────
  const onLayerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    const box = e.currentTarget.getBoundingClientRect();
    const additive = e.metaKey || e.ctrlKey || e.shiftKey;
    marqueeStart.current = { x: e.clientX - box.left, y: e.clientY - box.top, base: additive ? new Set(selected) : new Set() };
    if (!additive) setSelected(new Set());
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onLayerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = marqueeStart.current;
    if (!start || !layout) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const rect = { x0: Math.min(start.x, x), y0: Math.min(start.y, y), x1: Math.max(start.x, x), y1: Math.max(start.y, y) };
    if (rect.x1 - rect.x0 < 4 && rect.y1 - rect.y0 < 4) return;
    setMarquee(rect);
    const hit = new Set(start.base);
    for (const id of ICON_IDS) {
      const p = cellToPx(layout[id]);
      const ix = p.x;
      const iy = p.y - 36; // layer starts under the menu bar
      if (ix < rect.x1 && ix + ICON_W > rect.x0 && iy < rect.y1 && iy + ICON_H > rect.y0) hit.add(id);
    }
    setSelected(hit);
  };

  const onLayerUp = () => {
    marqueeStart.current = null;
    setMarquee(null);
  };

  // Before mount (SSR) we don't know the viewport: render the classic single column so nothing jumps.
  const positions = layout ?? Object.fromEntries(ICON_IDS.filter((id) => id !== TRASH).map((id, i) => [id, { c: 0, r: i }]));
  const trashCell = layout?.[TRASH];
  const target =
    drag && !drag.overTrash && layout && grid
      ? (() => {
          const { x, y } = cellToPx(layout[drag.primary]);
          return cellToPx(pxToCell(x + drag.dx, y + drag.dy, grid));
        })()
      : null;

  return (
    <div
      ref={layer}
      aria-label="Desktop"
      role="group"
      onPointerDown={onLayerDown}
      onPointerMove={onLayerMove}
      onPointerUp={onLayerUp}
      onPointerCancel={onLayerUp}
      className="absolute inset-x-0 bottom-0 top-9 touch-none select-none"
    >
      {target && (
        <div
          aria-hidden
          className="icon-target absolute rounded-md"
          style={{ left: target.x, top: target.y - 36, width: ICON_W, height: ICON_H }}
        />
      )}
      {marquee && (
        <div
          aria-hidden
          className="absolute border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
          style={{ left: marquee.x0, top: marquee.y0, width: marquee.x1 - marquee.x0, height: marquee.y1 - marquee.y0 }}
        />
      )}

      {ICON_IDS.map((id) => {
        const isTrash = id === TRASH;
        if (isTrash && !trashCell) return null;
        const cell = positions[id];
        const base = cellToPx(cell);
        const dragging = drag?.ids.includes(id);
        const inTrash = trashed?.phase === "in" && trashed.ids.includes(id);
        const respawn = trashed?.phase === "out" && trashed.ids.includes(id);
        let x = base.x;
        let y = base.y - 36;
        let transform = "";
        if (dragging && drag) {
          x += drag.dx;
          y += drag.dy;
          transform = `rotate(${drag.tilt}deg) scale(${drag.overTrash ? 0.72 : 1.06})`;
        } else if (inTrash && trashCell) {
          const t = cellToPx(trashCell);
          x = t.x;
          y = t.y - 36;
          transform = "scale(0.15)";
        }
        const Icon = isTrash ? (trashed?.phase === "in" ? Trash2 : Trash) : appById(id as AppId).icon;
        const hot = isTrash && drag?.overTrash;
        return (
          <button
            key={id}
            type="button"
            data-cursor
            aria-label={isTrash ? "Trash" : `${NAMES[id]} — double-click to open`}
            aria-pressed={selected.has(id)}
            onPointerDown={onIconDown(id)}
            onPointerMove={onIconMove}
            onPointerUp={onIconUp}
            onPointerCancel={onIconUp}
            onDoubleClick={() => openIcon(id)}
            onKeyDown={onIconKey(id)}
            className={clsx(
              "desk-icon group absolute flex flex-col items-center gap-[7px] text-label outline-none",
              dragging && "is-dragging",
              dragging && drag?.overTrash && "is-over-trash",
              isTrash && trashed?.phase === "in" && "is-eating",
              inTrash && "is-trashed",
              respawn && "is-respawn",
              hot && "is-hot",
            )}
            style={{ width: ICON_W, height: ICON_H, transform: `translate(${x}px, ${y}px)` }}
          >
            <span className={clsx("key desk-icon-key flex size-[52px] items-center justify-center", selected.has(id) && "is-selected")} style={{ transform }}>
              <Icon size={22} strokeWidth={1.6} aria-hidden />
            </span>
            <span
              className={clsx(
                "whitespace-nowrap rounded-sm px-1.5 font-mono text-[11px] font-medium",
                selected.has(id) ? "bg-accent text-accent-ink" : "[text-shadow:0_1px_0_rgba(0,0,0,0.15)]",
              )}
            >
              {hot ? "Drop to delete" : NAMES[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

