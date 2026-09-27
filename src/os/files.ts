// A tiny per-visitor file system (notes, folders, images) kept in localStorage.
// Pure functions only — React state and persistence live in state.tsx; tests in scripts/selfcheck.mts.
export type Kind = "note" | "folder" | "image";
export const TRASH = "trash";

export interface Item {
  id: string;
  kind: Kind;
  name: string;
  /** folder id, TRASH, or null for the desktop */
  parent: string | null;
  content?: string;
  src?: string;
  /** where it was before going to the trash */
  from?: string | null;
  trashedAt?: number;
  updatedAt: number;
}

export type Fs = Record<string, Item>;

export const newId = () => `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const childrenOf = (fs: Fs, parent: string | null) =>
  Object.values(fs)
    .filter((i) => i.parent === parent)
    .sort((a, b) => Number(b.kind === "folder") - Number(a.kind === "folder") || a.name.localeCompare(b.name));

export function isInside(fs: Fs, id: string, ancestor: string): boolean {
  let cur = fs[id]?.parent ?? null;
  for (let guard = 0; cur && guard < 64; guard++) {
    if (cur === ancestor) return true;
    cur = fs[cur]?.parent ?? null;
  }
  return false;
}

/** "untitled.txt" → "untitled 2.txt" if taken among siblings. */
export function uniqueName(fs: Fs, parent: string | null, wanted: string, except?: string): string {
  const taken = new Set(childrenOf(fs, parent).filter((i) => i.id !== except).map((i) => i.name.toLowerCase()));
  if (!taken.has(wanted.toLowerCase())) return wanted;
  const dot = wanted.lastIndexOf(".");
  const [stem, ext] = dot > 0 ? [wanted.slice(0, dot), wanted.slice(dot)] : [wanted, ""];
  for (let n = 2; ; n++) {
    const candidate = `${stem} ${n}${ext}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

export function create(fs: Fs, kind: Kind, parent: string | null, name?: string, extra: Partial<Item> = {}, now = Date.now()): [Fs, Item] {
  const base = name ?? (kind === "folder" ? "untitled folder" : "untitled.txt");
  const item: Item = { id: newId(), kind, name: uniqueName(fs, parent, base), parent, updatedAt: now, ...(kind === "note" ? { content: "" } : {}), ...extra };
  return [{ ...fs, [item.id]: item }, item];
}

export function rename(fs: Fs, id: string, raw: string): Fs {
  const item = fs[id];
  let name = raw.trim().replace(/[/\\]/g, "-");
  if (!item || !name) return fs;
  if (item.kind === "note" && !name.includes(".")) name += ".txt";
  return { ...fs, [id]: { ...item, name: uniqueName(fs, item.parent, name, id), updatedAt: Date.now() } };
}

export const setContent = (fs: Fs, id: string, content: string): Fs =>
  fs[id] ? { ...fs, [id]: { ...fs[id], content, updatedAt: Date.now() } } : fs;

/** Move top-level items to the trash, remembering where they came from. */
export function toTrash(fs: Fs, ids: string[], now = Date.now()): Fs {
  const out = { ...fs };
  for (const id of ids) {
    const item = out[id];
    if (!item || item.parent === TRASH) continue;
    out[id] = { ...item, from: item.parent, parent: TRASH, trashedAt: now };
  }
  return out;
}

export function putBack(fs: Fs, ids: string[]): Fs {
  let out = { ...fs };
  for (const id of ids) {
    const item = out[id];
    if (!item || item.parent !== TRASH) continue;
    const home = item.from && out[item.from] && out[item.from].parent !== TRASH ? item.from : null;
    out = { ...out, [id]: { ...item, parent: home, from: undefined, trashedAt: undefined } };
    out[id] = { ...out[id], name: uniqueName(out, home, item.name, id) };
  }
  return out;
}

/** Permanently delete trashed items (all, or the given ids) together with everything inside them. */
export function emptyTrash(fs: Fs, ids?: string[]): Fs {
  const doomed = new Set((ids ?? Object.values(fs).filter((i) => i.parent === TRASH).map((i) => i.id)).filter((id) => fs[id]?.parent === TRASH));
  return Object.fromEntries(Object.entries(fs).filter(([id]) => !doomed.has(id) && ![...doomed].some((d) => isInside(fs, id, d))));
}

/** Move items into a folder (or the desktop with null). A folder can't go inside itself. */
export function moveInto(fs: Fs, ids: string[], folder: string | null): Fs {
  let out = { ...fs };
  for (const id of ids) {
    const item = out[id];
    if (!item || id === folder || (folder && isInside(out, folder, id)) || item.parent === folder) continue;
    out = { ...out, [id]: { ...item, parent: folder } };
    out[id] = { ...out[id], name: uniqueName(out, folder, item.name, id) };
  }
  return out;
}

export function seedFs(now = Date.now()): Fs {
  const items: Item[] = [
    {
      id: "seed-readme",
      kind: "note",
      name: "readme.txt",
      parent: null,
      updatedAt: now,
      content: [
        "Welcome to kittipan OS.",
        "",
        "· Double-click an icon to open it. Drag icons anywhere — they remember.",
        "· Right-click the desktop: New Note, New Folder.",
        "· Drag files onto the Trash. They really go (Put Back, or Empty Trash).",
        "  Apps don't. Try it anyway.",
        "· ⌘K opens Spotlight. The Terminal knows a few tricks: type help.",
        "",
        "Everything you create stays in this browser. Nobody else sees it.",
      ].join("\n"),
    },
    {
      id: "seed-todo",
      kind: "note",
      name: "todo.txt",
      parent: null,
      updatedAt: now,
      content: [
        "TODO — kittipan OS",
        "",
        "[x] boot in under a second",
        "[x] make the sun cast real shadows",
        "[x] snake",
        "[x] let the trash actually delete things",
        "[ ] more case studies",
        "[ ] touch grass",
      ].join("\n"),
    },
    { id: "seed-shot", kind: "image", name: "kittipan-os-v2.jpg", parent: null, updatedAt: now, src: "/projects/kittipan-os.jpg" },
    { id: "seed-old", kind: "folder", name: "Old site", parent: null, updatedAt: now },
    {
      id: "seed-v1",
      kind: "note",
      name: "link-in-bio.txt",
      parent: "seed-old",
      updatedAt: now,
      content: [
        "kittipan.net v1 — a dark bento link-in-bio card.",
        "",
        "It had a 'live telemetry' panel with a ping meter.",
        "The ping meter was not entirely honest.",
        "We don't talk about the ping meter.",
      ].join("\n"),
    },
  ];
  return Object.fromEntries(items.map((i) => [i.id, i]));
}
