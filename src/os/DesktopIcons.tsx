"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { Trash, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { APPS, appById, type AppId } from "./apps";
import { useOS } from "./state";
import { TRASH as TRASH_PARENT, childrenOf, create, moveInto, newId, rename, toTrash, type Kind } from "./files";
import { KIND_ICON } from "./apps/Files";
import { cellToPx, defaultLayout, gridFor, moveIcons, pxToCell, resolveLayout, sortLayout, type Cell, type Grid, type Layout } from "./desktop";

const TRASH = "trash";
const APP_IDS = APPS.filter((a) => !a.hidden).map((a) => a.id as string);
const STORE = "kos_icons";
const ICON_W = 88;
const ICON_H = 84;
const MENU_H = 36;

const QUIPS: Record<string, string> = {
  about: "about.app is load-bearing. It came back.",
  contact: "Deleting Contact? Then how would you reach me.",
  terminal: "terminal: rm: permission denied.",
  settings: "Settings restored. They were fine the way they were.",
  projects: "Projects can't be deleted — only shipped.",
  launchpad: "launchpad is owner-only. Even in the trash.",
};

type Drag = { ids: string[]; primary: string; dx: number; dy: number; tilt: number; drop: string | null };
type Gesture = { ids: string[]; primary: string; px: number; py: number; lastX: number; moved: boolean };
type Rect = { x0: number; y0: number; x1: number; y1: number };
type Absorb = { ids: string[]; to: Cell; phase: "in" | "out"; bounce: string[] };

const readSaved = (): Layout => {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}");
  } catch {
    return {};
  }
};

/** Desktop icons: apps, your files and the Trash. Drag, marquee-select, drop into folders or the Trash. */
export function DesktopIcons() {
  const { state, open, openItem, notify, dispatch, fsApply } = useOS();
  const [grid, setGrid] = useState<Grid | null>(null);
  const [saved, setSaved] = useState<Layout>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [absorb, setAbsorb] = useState<Absorb | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const marqueeStart = useRef<{ x: number; y: number; base: Set<string> } | null>(null);

  const files = useMemo(() => childrenOf(state.fs, null), [state.fs]);
  const iconIds = useMemo(() => [...APP_IDS, ...files.map((f) => f.id), TRASH], [files]);
  const isFile = useCallback((id: string) => !!state.fs[id], [state.fs]);
  const nameOf = useCallback((id: string) => (id === TRASH ? "Trash" : (state.fs[id]?.name ?? appById(id as AppId).title)), [state.fs]);
  const trashFull = useMemo(() => Object.values(state.fs).some((i) => i.parent === TRASH_PARENT), [state.fs]);

  useEffect(() => {
    setSaved(readSaved());
    const fit = () => setGrid(gridFor(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const layout = useMemo(() => (grid ? resolveLayout(saved, iconIds, grid, isFile) : null), [saved, grid, iconIds, isFile]);

  const commit = useCallback((next: Layout) => {
    setSaved(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  }, []);

  // Right-click desktop menu → clean up / sort / new note / new folder.
  useEffect(() => {
    const onIcons = (e: Event) => {
      if (!grid || !layout) return;
      const action = (e as CustomEvent<string>).detail;
      commit(
        action === "sort"
          ? sortLayout(layout, Object.fromEntries(iconIds.map((id) => [id, nameOf(id)])), grid)
          : defaultLayout(iconIds, grid, TRASH, isFile),
      );
      sound.playToggleClick(true);
    };
    const onNew = (e: Event) => {
      if (!grid || !layout) return;
      const { kind, x, y } = (e as CustomEvent<{ kind: Kind; x: number; y: number }>).detail;
      const id = newId();
      commit({ ...layout, [id]: pxToCell(x - ICON_W / 2, y - ICON_H / 2, grid) });
      fsApply((fs) => create(fs, kind, null, undefined, { id })[0]);
      setSelected(new Set([id]));
      setRenaming({ id, value: kind === "folder" ? "untitled folder" : "untitled" });
      sound.playPop();
    };
    window.addEventListener("kos:icons", onIcons);
    window.addEventListener("kos:new", onNew);
    return () => {
      window.removeEventListener("kos:icons", onIcons);
      window.removeEventListener("kos:new", onNew);
    };
  }, [grid, layout, commit, iconIds, isFile, nameOf, fsApply]);

  const openIcon = (id: string) => {
    sound.playMechanicalClick();
    if (id === TRASH) open("trash");
    else if (state.fs[id]) openItem(id, state.fs[id].kind);
    else open(id as AppId);
  };

  /** Files really move (to the trash or a folder); apps get swallowed and spat back out. */
  const absorbInto = (ids: string[], target: string) => {
    if (!layout || absorb) return;
    const movers = ids.filter((id) => id !== TRASH && id !== target);
    const fileIds = movers.filter((id) => state.fs[id]);
    const bounce = target === TRASH ? movers.filter((id) => !state.fs[id]) : [];
    if (movers.length === 0 || (target !== TRASH && fileIds.length === 0)) return;
    setDrag(null);
    setSelected(new Set());
    setAbsorb({ ids: target === TRASH ? movers : fileIds, to: layout[target], phase: "in", bounce });
    setTimeout(() => (target === TRASH ? sound.playCrunch() : sound.playMechanicalClick()), 200);
    const where = target === TRASH ? "Trash" : state.fs[target]?.name;
    setTimeout(() => {
      if (fileIds.length) fsApply((fs) => (target === TRASH ? toTrash(fs, fileIds) : moveInto(fs, fileIds, target)));
      if (!bounce.length) {
        setAbsorb(null);
        notify(fileIds.length === 1 ? `${state.fs[fileIds[0]].name} → ${where}` : `${fileIds.length} items → ${where}`);
      }
    }, 330);
    if (!bounce.length) return;
    setTimeout(() => {
      setAbsorb({ ids: bounce, to: layout[TRASH], phase: "out", bounce });
      sound.playPop();
      dispatch({ type: "trashed", ids: bounce as AppId[] });
      const quip = bounce.length === 1 ? (QUIPS[bounce[0]] ?? `${bounce[0]} is a system file. Nice try.`) : `Nice try. ${bounce.length} apps respawned.`;
      notify(fileIds.length ? `${fileIds.length} file${fileIds.length > 1 ? "s" : ""} trashed. ${quip}` : quip);
    }, 1000);
    setTimeout(() => setAbsorb(null), 1700);
  };

  const dropTargetAt = (clientX: number, clientY: number, dragging: string[]): string | null => {
    if (!layout) return null;
    for (const id of [TRASH, ...files.filter((f) => f.kind === "folder").map((f) => f.id)]) {
      if (dragging.includes(id) || !layout[id]) continue;
      const { x, y } = cellToPx(layout[id]);
      if (clientX >= x - 10 && clientX <= x + ICON_W + 10 && clientY >= y - 10 && clientY <= y + ICON_H + 10) return id;
    }
    return null;
  };

  const startRename = (id: string) => {
    const name = state.fs[id]?.name ?? "";
    setRenaming({ id, value: state.fs[id]?.kind === "note" ? name.replace(/\.txt$/, "") : name });
  };
  const finishRename = (save: boolean) => {
    if (renaming && save) {
      const { id, value } = renaming;
      fsApply((fs) => rename(fs, id, value));
    }
    setRenaming(null);
  };

  // ── Icon pointer handling ────────────────────────────────
  const onIconDown = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !layout || renaming?.id === id) return;
    e.stopPropagation();
    setMenu(null);
    const additive = e.metaKey || e.ctrlKey || e.shiftKey;
    let next = new Set(selected);
    if (additive) next.has(id) ? next.delete(id) : next.add(id);
    else if (!next.has(id)) next = new Set([id]);
    setSelected(next);
    gesture.current = { ids: next.has(id) ? [...next] : [id], primary: id, px: e.clientX, py: e.clientY, lastX: e.clientX, moved: false };
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
    setDrag((prev) => ({
      ids: g.ids,
      primary: g.primary,
      dx,
      dy,
      tilt: Math.max(-9, Math.min(9, (prev?.tilt ?? 0) * 0.7 + vx * 0.6)),
      drop: dropTargetAt(e.clientX, e.clientY, g.ids),
    }));
  };

  const onIconUp = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.moved || !drag || !layout || !grid) {
      setDrag(null);
      return;
    }
    if (drag.drop) {
      if (drag.drop === TRASH || g.ids.some((id) => state.fs[id])) return absorbInto(g.ids, drag.drop);
      notify("Apps live on the desktop. Files go in folders.");
    }
    const from = layout[g.primary];
    const { x, y } = cellToPx(from);
    const to = pxToCell(x + drag.dx, y + drag.dy, grid);
    commit(moveIcons(layout, g.ids, { c: to.c - from.c, r: to.r - from.r }, grid));
    sound.playMechanicalClick();
    setDrag(null);
  };

  const onIconKey = (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (renaming) return;
    if (e.key === "Enter") openIcon(id);
    else if (e.key === "F2" && state.fs[id]) startRename(id);
    else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      absorbInto(selected.size ? [...selected] : [id], TRASH);
    }
  };

  const onIconMenu = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(new Set([id]));
    setMenu({ id, x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 160) });
  };

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [menu]);

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
    for (const id of iconIds) {
      if (!layout[id]) continue;
      const p = cellToPx(layout[id]);
      const iy = p.y - MENU_H;
      if (p.x < rect.x1 && p.x + ICON_W > rect.x0 && iy < rect.y1 && iy + ICON_H > rect.y0) hit.add(id);
    }
    setSelected(hit);
  };

  const onLayerUp = () => {
    marqueeStart.current = null;
    setMarquee(null);
  };

  // Before mount (SSR) we don't know the viewport: render the classic single column so nothing jumps.
  const positions: Layout = layout ?? Object.fromEntries(APP_IDS.map((id, i) => [id, { c: 0, r: i }]));
  const target =
    drag && !drag.drop && layout && grid
      ? (() => {
          const { x, y } = cellToPx(layout[drag.primary]);
          return cellToPx(pxToCell(x + drag.dx, y + drag.dy, grid));
        })()
      : null;
  const menuFile = menu ? state.fs[menu.id] : undefined;

  return (
    <div
      aria-label="Desktop"
      role="group"
      onPointerDown={onLayerDown}
      onPointerMove={onLayerMove}
      onPointerUp={onLayerUp}
      onPointerCancel={onLayerUp}
      className="absolute inset-x-0 bottom-0 top-9 touch-none select-none"
    >
      {target && <div aria-hidden className="icon-target absolute rounded-md" style={{ left: target.x, top: target.y - MENU_H, width: ICON_W, height: ICON_H }} />}
      {marquee && (
        <div
          aria-hidden
          className="absolute border border-accent bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
          style={{ left: marquee.x0, top: marquee.y0, width: marquee.x1 - marquee.x0, height: marquee.y1 - marquee.y0 }}
        />
      )}

      {iconIds.map((id) => {
        const cell = positions[id];
        if (!cell) return null;
        const isTrash = id === TRASH;
        const file = state.fs[id];
        const base = cellToPx(cell);
        const dragging = drag?.ids.includes(id);
        const absorbed = absorb?.phase === "in" && absorb.ids.includes(id);
        const respawn = absorb?.phase === "out" && absorb.ids.includes(id);
        let x = base.x;
        let y = base.y - MENU_H;
        let transform = "";
        if (dragging && drag) {
          x += drag.dx;
          y += drag.dy;
          transform = `rotate(${drag.tilt}deg) scale(${drag.drop ? 0.72 : 1.06})`;
        } else if (absorbed && absorb) {
          const t = cellToPx(absorb.to);
          x = t.x;
          y = t.y - MENU_H;
          transform = "scale(0.15)";
        }
        const Icon = isTrash ? (trashFull || absorb?.phase === "in" ? Trash2 : Trash) : file ? KIND_ICON[file.kind] : appById(id as AppId).icon;
        const hot = drag?.drop === id;
        const eating = absorb?.phase === "in" && layout?.[id] && absorb.to.c === layout[id].c && absorb.to.r === layout[id].r;
        const label = hot ? (isTrash ? "Drop to delete" : "Move into") : nameOf(id);
        return (
          <button
            key={id}
            type="button"
            data-cursor
            aria-label={`${nameOf(id)} — double-click to open`}
            aria-pressed={selected.has(id)}
            onPointerDown={onIconDown(id)}
            onPointerMove={onIconMove}
            onPointerUp={onIconUp}
            onPointerCancel={onIconUp}
            onDoubleClick={() => renaming?.id !== id && openIcon(id)}
            onKeyDown={onIconKey(id)}
            onContextMenu={onIconMenu(id)}
            className={clsx(
              "desk-icon group absolute flex flex-col items-center gap-[7px] text-label outline-none",
              dragging && "is-dragging",
              dragging && drag?.drop && "is-over-trash",
              absorbed && "is-trashed",
              respawn && "is-respawn",
              hot && "is-hot",
              eating && "is-eating",
            )}
            style={{ width: ICON_W, height: ICON_H, transform: `translate(${x}px, ${y}px)` }}
          >
            <span className={clsx("key desk-icon-key flex size-[52px] items-center justify-center", selected.has(id) && "is-selected")} style={{ transform }}>
              <Icon size={22} strokeWidth={1.6} aria-hidden />
            </span>
            {renaming?.id === id ? (
              <input
                autoFocus
                value={renaming.value}
                aria-label="New name"
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setRenaming({ id, value: e.target.value })}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") finishRename(true);
                  if (e.key === "Escape") finishRename(false);
                }}
                onBlur={() => finishRename(true)}
                className="w-[96px] rounded-sm border border-accent bg-panel px-1 text-center font-mono text-[11px] text-ink outline-none"
              />
            ) : (
              <span
                className={clsx(
                  "max-w-[92px] truncate whitespace-nowrap rounded-sm px-1.5 font-mono text-[11px] font-medium",
                  selected.has(id) ? "bg-accent text-accent-ink" : "[text-shadow:0_1px_0_rgba(0,0,0,0.15)]",
                )}
              >
                {label}
              </span>
            )}
          </button>
        );
      })}

      {menu && (
        <div
          role="menu"
          aria-label={nameOf(menu.id)}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ left: menu.x, top: menu.y - MENU_H }}
          className="absolute z-[170] w-[190px] rounded-md border border-black bg-[#1c1c1a] p-1.5 font-mono text-xs text-[#edebe5] shadow-[0_4px_0_#000,0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {[
            { label: "Open", run: () => openIcon(menu.id) },
            ...(menuFile ? [{ label: "Rename", run: () => startRename(menu.id) }] : []),
            ...(menu.id !== TRASH ? [{ label: "Move to Trash", run: () => absorbInto([menu.id], TRASH) }] : []),
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setMenu(null);
                item.run();
              }}
              className="flex w-full rounded-sm px-2.5 py-1.5 text-left hover:bg-[#2e2e2a] focus:bg-[#2e2e2a] focus:outline-none"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
