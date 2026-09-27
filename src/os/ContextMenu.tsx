"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { useOS, type ThemePref } from "./state";

function Item({
  children,
  onSelect,
  checked,
}: {
  children: ReactNode;
  onSelect: () => void;
  checked?: boolean;
}) {
  return (
    <button
      type="button"
      role={checked === undefined ? "menuitem" : "menuitemradio"}
      aria-checked={checked}
      onClick={() => {
        sound.playMechanicalClick();
        onSelect();
      }}
      className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left hover:bg-[#2e2e2a] focus:bg-[#2e2e2a] focus:outline-none"
    >
      <span
        className={clsx(
          "size-1.5 shrink-0 rounded-full",
          checked ? "bg-accent" : "bg-transparent",
        )}
        aria-hidden
      />
      <span className="grow">{children}</span>
    </button>
  );
}

const Sep = () => <div role="separator" className="my-1 h-px bg-[#34332f]" />;

/** Desktop right-click menu. Always dark, like hardware menus on an LCD. */
export function ContextMenu({
  x,
  y,
  onClose,
}: {
  x: number;
  y: number;
  onClose: () => void;
}) {
  const os = useOS();
  const { state } = os;
  const ref = useRef<HTMLDivElement>(null);
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const away = (e: PointerEvent) =>
      !ref.current?.contains(e.target as Node) && onClose();
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [onClose]);

  const onKeyDown = (e: KeyboardEvent) => {
    const items = [
      ...(ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? []),
    ];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus();
    else if (e.key === "ArrowUp")
      items[(i - 1 + items.length) % items.length]?.focus();
    else if (e.key === "Escape") onClose();
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const left = Math.min(x, window.innerWidth - 236);
  const top = Math.min(y, window.innerHeight - 380);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Desktop"
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      style={{ left, top }}
      className="fixed z-[170] w-[224px] rounded-md border border-black bg-[#1c1c1a] p-1.5 font-mono text-xs text-[#edebe5] shadow-[0_4px_0_#000,0_20px_50px_rgba(0,0,0,0.5)]"
    >
      <Item onSelect={run(() => os.open("terminal"))}>Open Terminal</Item>
      <Item onSelect={run(() => os.open("projects"))}>Open Projects</Item>
      <Item onSelect={run(() => os.open("settings"))}>Settings…</Item>
      <Sep />
      <div className="caps px-2.5 pb-1 pt-1.5 text-[#8c897f]">Lighting</div>
      {(["auto", "dawn", "day", "dusk", "night"] as ThemePref[]).map((p) => (
        <Item
          key={p}
          checked={state.themePref === p}
          onSelect={run(() => os.setTheme(p))}
        >
          {p === "auto" ? "Follow the sun" : p[0].toUpperCase() + p.slice(1)}
        </Item>
      ))}
      <Sep />
      <Item
        checked={state.live}
        onSelect={run(() => os.setPrefs({ live: !state.live }))}
      >
        Live wallpaper
      </Item>
      <Item
        onSelect={run(() => window.dispatchEvent(new Event("kos:screensaver")))}
      >
        Start screensaver
      </Item>
      <Item onSelect={run(() => os.dispatch({ type: "reboot", on: true }))}>
        Reboot…
      </Item>
    </div>
  );
}
