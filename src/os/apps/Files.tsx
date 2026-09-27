"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpFromLine, Download, FilePlus, FileText, FolderClosed, FolderPlus, Image as ImageIcon, Trash2, Undo2 } from "lucide-react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { useOS } from "../state";
import { TRASH, childrenOf, create, emptyTrash, moveInto, newId, putBack, rename, setContent, toTrash, type Item, type Kind } from "../files";
import { appById } from "../apps";
import { bangkokTime } from "../sun";
import { Caps, Key } from "../ui";

export const KIND_ICON: Record<Kind, typeof FileText> = { note: FileText, folder: FolderClosed, image: ImageIcon };

const ago = (t?: number) => (t ? `${new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${bangkokTime(new Date(t))}` : "");

function Missing({ what }: { what: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <Caps>nothing open</Caps>
      <p className="m-0 font-sans text-sm text-sub">This {what} was moved to the Trash or deleted.</p>
    </div>
  );
}

/* ─── Notes ─────────────────────────────────────────────── */
export function Notes() {
  const { state, fsApply, notify } = useOS();
  const id = state.docs.notes;
  const item = id ? state.fs[id] : undefined;
  const [draft, setDraft] = useState(item?.content ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Switching to another note replaces the editor contents.
  useEffect(() => {
    setDraft(item?.content ?? "");
    setName(item?.name ?? "");
  }, [id]);

  if (!id || !item || item.parent === TRASH) return <Missing what="note" />;

  const onChange = (value: string) => {
    setDraft(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fsApply((fs) => setContent(fs, id, value)), 250);
  };
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <label className="flex grow items-center gap-2">
          <span className="sr-only">File name</span>
          <FileText size={15} className="shrink-0 text-sub" aria-hidden />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => fsApply((fs) => rename(fs, id, name))}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
            className="min-w-0 grow rounded-sm border border-transparent bg-transparent px-1.5 py-1 font-mono text-[13px] font-semibold text-ink outline-none hover:border-line focus:border-accent"
          />
        </label>
        <Key
          aria-label="Move note to Trash"
          className="flex size-8 items-center justify-center"
          onClick={() => {
            fsApply((fs) => toTrash(fs, [id]));
            sound.playCrunch();
            notify(`${item.name} moved to Trash`);
          }}
        >
          <Trash2 size={15} aria-hidden />
        </Key>
      </div>
      <label className="flex min-h-0 grow">
        <span className="sr-only">Note</span>
        <textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Start typing…"
          className="scroll-quiet min-h-0 grow resize-none border-0 bg-card px-5 py-4 font-mono text-[14px] leading-relaxed text-ink outline-none placeholder:text-sub"
        />
      </label>
      <div className="flex justify-between border-t border-line px-4 py-2 font-mono text-[11px] text-sub">
        <span>
          {words} words · {draft.length} chars
        </span>
        <span>saved on this device · {ago(item.updatedAt)}</span>
      </div>
    </div>
  );
}

/* ─── Shared file grid (folder + trash) ─────────────────── */
function FileGrid({
  items,
  selected,
  setSelected,
  onOpen,
  onDelete,
  empty,
}: {
  items: Item[];
  selected: Set<string>;
  setSelected: (s: Set<string>) => void;
  onOpen: (item: Item) => void;
  onDelete?: (ids: string[]) => void;
  empty: string;
}) {
  if (items.length === 0) return <p className="m-0 p-6 text-center font-sans text-sm text-sub">{empty}</p>;
  const onKey = (item: Item) => (e: KeyboardEvent) => {
    if (e.key === "Enter") onOpen(item);
    if ((e.key === "Delete" || e.key === "Backspace") && onDelete) {
      e.preventDefault();
      onDelete(selected.size ? [...selected] : [item.id]);
    }
  };
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 p-4">
      {items.map((item) => {
        const Icon = KIND_ICON[item.kind];
        const on = selected.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={(e) => {
                const next = e.metaKey || e.ctrlKey || e.shiftKey ? new Set(selected) : new Set<string>();
                next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                setSelected(next);
              }}
              onDoubleClick={() => onOpen(item)}
              onKeyDown={onKey(item)}
              className="flex w-full flex-col items-center gap-1.5 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className={clsx("key flex size-12 items-center justify-center", on && "outline outline-2 outline-offset-2 outline-accent")}>
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </span>
              <span className={clsx("max-w-full truncate rounded-sm px-1.5 font-mono text-[11px]", on ? "bg-accent text-accent-ink" : "text-ink")}>{item.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Folder ────────────────────────────────────────────── */
export function Folder() {
  const { state, fsApply, openItem, notify } = useOS();
  const id = state.docs.folder;
  const folder = id ? state.fs[id] : undefined;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  if (!id || !folder || folder.parent === TRASH) return <Missing what="folder" />;

  const items = childrenOf(state.fs, id);
  const trash = (ids: string[]) => {
    fsApply((fs) => toTrash(fs, ids));
    setSelected(new Set());
    sound.playCrunch();
    notify(ids.length === 1 ? `${state.fs[ids[0]]?.name} moved to Trash` : `${ids.length} items moved to Trash`);
  };
  const add = (kind: Kind) => {
    const newIdValue = newId();
    fsApply((fs) => create(fs, kind, id, undefined, { id: newIdValue })[0]);
    setSelected(new Set([newIdValue]));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <span className="grow truncate font-mono text-xs text-sub">
          Desktop / <span className="text-ink">{folder.name}</span> · {items.length} items
        </span>
        <Key aria-label="New note" className="flex size-8 items-center justify-center" onClick={() => add("note")}>
          <FilePlus size={15} aria-hidden />
        </Key>
        <Key aria-label="New folder" className="flex size-8 items-center justify-center" onClick={() => add("folder")}>
          <FolderPlus size={15} aria-hidden />
        </Key>
        <Key
          aria-label="Move selected to Desktop"
          disabled={!selected.size}
          className="flex size-8 items-center justify-center disabled:opacity-40"
          onClick={() => {
            fsApply((fs) => moveInto(fs, [...selected], null));
            setSelected(new Set());
          }}
        >
          <ArrowUpFromLine size={15} aria-hidden />
        </Key>
        <Key aria-label="Move selected to Trash" disabled={!selected.size} className="flex size-8 items-center justify-center disabled:opacity-40" onClick={() => trash([...selected])}>
          <Trash2 size={15} aria-hidden />
        </Key>
      </div>
      <div className="scroll-quiet min-h-0 grow overflow-y-auto">
        <FileGrid
          items={items}
          selected={selected}
          setSelected={setSelected}
          onOpen={(item) => openItem(item.id, item.kind)}
          onDelete={trash}
          empty="Empty folder. Drag files onto this folder's icon on the desktop, or make a new note."
        />
      </div>
    </div>
  );
}

/* ─── Preview (images) ──────────────────────────────────── */
export function Preview() {
  const { state, fsApply, notify } = useOS();
  const id = state.docs.preview;
  const item = id ? state.fs[id] : undefined;
  if (!id || !item || item.parent === TRASH || !item.src) return <Missing what="image" />;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <span className="grow truncate font-mono text-xs text-ink">{item.name}</span>
        <a href={item.src} download={item.name} aria-label="Download image" className="key flex size-8 items-center justify-center">
          <Download size={15} aria-hidden />
        </a>
        <Key
          aria-label="Move image to Trash"
          className="flex size-8 items-center justify-center"
          onClick={() => {
            fsApply((fs) => toTrash(fs, [id]));
            sound.playCrunch();
            notify(`${item.name} moved to Trash`);
          }}
        >
          <Trash2 size={15} aria-hidden />
        </Key>
      </div>
      <div className="flex min-h-0 grow items-center justify-center bg-[#0d0e0c] p-4">
        <img src={item.src} alt={item.name} className="max-h-full max-w-full rounded-sm object-contain shadow-[0_10px_40px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}

/* ─── Trash ─────────────────────────────────────────────── */
export function Trash() {
  const { state, fsApply, notify } = useOS();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const items = childrenOf(state.fs, TRASH);
  const attempts = state.trashLog.length;

  const restore = (ids: string[]) => {
    fsApply((fs) => putBack(fs, ids));
    setSelected(new Set());
    sound.playPop();
    notify(ids.length === 1 ? `${state.fs[ids[0]]?.name} put back` : `${ids.length} items put back`);
  };
  const erase = (ids?: string[]) => {
    fsApply((fs) => emptyTrash(fs, ids));
    setSelected(new Set());
    setConfirming(false);
    sound.playCrunch();
    notify(ids ? `${ids.length} item${ids.length > 1 ? "s" : ""} deleted forever` : "Trash emptied");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="lcd m-4 mb-0 flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <span className="caps text-lcd-sub">In trash</span>
          <span className="lcd-digits text-[40px]">{String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="caps text-lcd-sub">Apps that escaped</span>
          <span className="lcd-digits text-[40px]">{String(attempts).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="scroll-quiet min-h-0 grow overflow-y-auto">
        <FileGrid
          items={items}
          selected={selected}
          setSelected={setSelected}
          onOpen={(item) => restore([item.id])}
          onDelete={(ids) => erase(ids)}
          empty="Trash is empty. Files you delete land here until you empty it."
        />
        {items.length > 0 && (
          <ul className="m-0 list-none px-5 pb-2 font-mono text-[11px] text-sub">
            {items.map((i) => (
              <li key={i.id}>
                {i.name} — from {i.from ? (state.fs[i.from]?.name ?? "a deleted folder") : "Desktop"} · {ago(i.trashedAt)}
              </li>
            ))}
          </ul>
        )}
        {attempts > 0 && (
          <p className="m-0 px-5 pb-3 font-mono text-[11px] text-sub">
            Escapes: {state.trashLog.slice(-4).map((e) => appById(e.id).file).join(", ")}
            {attempts > 4 ? ` +${attempts - 4}` : ""}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3">
        {confirming ? (
          <>
            <span className="mr-auto font-sans text-xs text-ink">Permanently erase {items.length} item{items.length > 1 ? "s" : ""}? This can&apos;t be undone.</span>
            <Key className="flex h-9 items-center px-3 font-mono text-xs" onClick={() => setConfirming(false)}>
              Cancel
            </Key>
            <Key accent className="flex h-9 items-center px-3 font-mono text-xs font-semibold" onClick={() => erase()}>
              Empty Trash
            </Key>
          </>
        ) : (
          <>
            <Key disabled={!selected.size} className="flex h-9 items-center gap-1.5 px-3 font-mono text-xs disabled:opacity-40" onClick={() => restore([...selected])}>
              <Undo2 size={14} aria-hidden /> Put Back
            </Key>
            <Key disabled={!selected.size} className="flex h-9 items-center gap-1.5 px-3 font-mono text-xs disabled:opacity-40" onClick={() => erase([...selected])}>
              Delete Now
            </Key>
            <Key disabled={!items.length} className="flex h-9 items-center px-3 font-mono text-xs disabled:opacity-40" onClick={() => setConfirming(true)}>
              Empty Trash
            </Key>
          </>
        )}
      </div>
    </div>
  );
}
