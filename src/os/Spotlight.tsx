"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import { profile } from "@/config/profile";
import { sound } from "@/lib/sound";
import { APPS } from "./apps";
import { copyText, downloadVCard } from "./actions";
import { unlockUrl, useOS } from "./state";
import { INSTALL_MESSAGE, installApp } from "./pwa";

interface Item {
  id: string;
  group: "Apps" | "Actions";
  title: string;
  hint: string;
  run: () => void;
}

// Subsequence match: "cnt" finds "Contact". Lower score = better.
function score(query: string, text: string): number | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  const direct = t.indexOf(q);
  if (direct >= 0) return direct;
  let ti = 0;
  for (const ch of q) {
    ti = t.indexOf(ch, ti);
    if (ti < 0) return null;
    ti++;
  }
  return 100 + ti;
}

export function Spotlight() {
  const os = useOS();
  const { state } = os;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const owner = state.owner.status === "owner";

  const items = useMemo<Item[]>(() => {
    const done = () => os.dispatch({ type: "spotlight", open: false });
    const act = (fn: () => void) => () => {
      fn();
      done();
    };
    return [
      ...APPS.map((a) => ({
        id: a.id,
        group: "Apps" as const,
        title: a.title,
        hint: a.ownerOnly && !owner ? "locked · owner only" : a.file,
        run: act(() => os.open(a.id)),
      })),
      {
        id: "vcard",
        group: "Actions",
        title: "Save contact (.vcf)",
        hint: "vCard",
        run: act(() => {
          downloadVCard();
          os.notify("Contact saved · kittipan-sankoh.vcf");
        }),
      },
      {
        id: "email",
        group: "Actions",
        title: "Copy email",
        hint: profile.email,
        run: act(async () =>
          os.notify(
            (await copyText(profile.email))
              ? `Copied ${profile.email}`
              : "Clipboard unavailable",
          ),
        ),
      },
      {
        id: "qr",
        group: "Actions",
        title: "Show QR code",
        hint: "contact.app",
        run: act(() => os.open("contact")),
      },
      {
        id: "lang",
        group: "Actions",
        title:
          state.lang === "th"
            ? "Switch content to English"
            : "Switch content to Thai",
        hint: "lang",
        run: act(() => os.setLang(state.lang === "th" ? "en" : "th")),
      },
      {
        id: "sound",
        group: "Actions",
        title: state.sound ? "Turn sound off" : "Turn sound on",
        hint: "sound",
        run: act(() => os.setSound(!state.sound)),
      },
      ...(["auto", "dawn", "day", "dusk", "night"] as const).map((p) => ({
        id: `theme-${p}`,
        group: "Actions" as const,
        title: p === "auto" ? "Lighting: follow the sun" : `Lighting: ${p}`,
        hint: "theme",
        run: act(() => os.setTheme(p)),
      })),
      {
        id: "install",
        group: "Actions",
        title: "Install as app",
        hint: "PWA",
        run: act(async () => os.notify(INSTALL_MESSAGE[await installApp()])),
      },
      {
        id: "reboot",
        group: "Actions",
        title: "Reboot",
        hint: "full boot sequence",
        run: act(() => os.dispatch({ type: "reboot", on: true })),
      },
      owner
        ? {
            id: "lock",
            group: "Actions",
            title: "Lock owner mode",
            hint: "sign out",
            run: act(os.lock),
          }
        : {
            id: "unlock",
            group: "Actions",
            title: "Unlock owner mode",
            hint: "Cloudflare Access",
            run: act(() => (location.href = unlockUrl)),
          },
    ];
  }, [os, state.lang, state.sound, owner]);

  const results = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          s: score(query, `${item.title} ${item.hint}`),
        }))
        .filter((r): r is { item: Item; s: number } => r.s !== null)
        .sort((a, b) => (query ? a.s - b.s : 0))
        .map((r) => r.item),
    [items, query],
  );

  useEffect(() => {
    setIndex(0);
  }, [query]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[index]) {
      sound.playMechanicalClick();
      results[index].run();
    }
  };

  let lastGroup = "";
  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 px-4 pt-[14vh]"
      onPointerDown={() => os.dispatch({ type: "spotlight", open: false })}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.12 }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] overflow-hidden rounded-xl border border-black bg-[#1c1c1a] text-[#edebe5] shadow-[0_5px_0_#000,0_40px_100px_rgba(0,0,0,0.6)]"
      >
        <label className="flex items-center gap-3.5 border-b border-[#34332f] px-5 py-[18px]">
          <Search size={20} className="shrink-0 text-[#a9a69e]" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search apps and actions"
            aria-label="Search apps and actions"
            aria-controls="spotlight-results"
            aria-activedescendant={
              results[index] ? `spot-${results[index].id}` : undefined
            }
            className="min-w-0 grow border-0 bg-transparent font-mono text-lg text-[#edebe5] outline-none placeholder:text-[#6b6962] sm:text-xl"
          />
          <kbd className="rounded-sm border border-[#34332f] px-1.5 py-0.5 font-mono text-[11px] text-[#8c897f]">
            esc
          </kbd>
        </label>
        <div
          id="spotlight-results"
          role="listbox"
          className="scroll-quiet max-h-[52vh] overflow-y-auto p-2 font-mono text-[13px]"
        >
          {results.length === 0 && (
            <p className="m-0 px-3 py-6 text-center text-[#8c897f]">
              No match. Try the Terminal.
            </p>
          )}
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? r.group : null;
            lastGroup = r.group;
            return (
              <div key={r.id}>
                {header && (
                  <div className="caps px-3 pb-1.5 pt-2.5 text-[#8c897f]">
                    {header}
                  </div>
                )}
                <button
                  type="button"
                  id={`spot-${r.id}`}
                  role="option"
                  aria-selected={i === index}
                  onPointerEnter={() => setIndex(i)}
                  onClick={() => {
                    sound.playMechanicalClick();
                    r.run();
                  }}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left",
                    i === index && "bg-[#2e2e2a]",
                  )}
                >
                  <span className="grow">{r.title}</span>
                  <span className="text-[11px] text-[#8c897f]">
                    {i === index ? "↵" : r.hint}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="hidden gap-[18px] border-t border-[#34332f] px-5 py-3 font-mono text-[11px] text-[#8c897f] sm:flex">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
          <span className="ml-auto">⌘K anywhere</span>
        </div>
      </motion.div>
    </div>
  );
}
