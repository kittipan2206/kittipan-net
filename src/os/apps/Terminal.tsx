"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import { pick, profile } from "@/config/profile";
import { sound } from "@/lib/sound";
import { APPS } from "../apps";
import { useOS } from "../state";
import { useWeather } from "../hooks";
import { bangkokTime } from "../sun";
import { describe } from "../weather";
import { complete, runCommand, type Line } from "../terminal";
import { VERSION_LABEL } from "../version";
import { childrenOf, create, toTrash } from "../files";
import { unlockUrl } from "../state";

const BANNER: Line[] = [
  { text: `kittipan OS ${VERSION_LABEL} · type \`help\` to list commands`, tone: "muted" },
];
const bootedAt = Date.now();

type Entry = { kind: "input"; text: string } | { kind: "output"; line: Line };

const toneClass: Record<NonNullable<Line["tone"]>, string> = {
  out: "text-[#d9d5cb]",
  muted: "text-[#8c897f]",
  accent: "text-lcd-ink",
  error: "text-lcd-ink",
};

function Prompt({ owner }: { owner: boolean }) {
  return (
    <span aria-hidden className="whitespace-nowrap">
      <span className="text-lcd-ink">
        {owner ? "kittipan" : "guest"}@kittipan-os
      </span>
      <span className="text-[#6b6962]">:~$ </span>
    </span>
  );
}

export function Terminal() {
  const os = useOS();
  const { state } = os;
  const weather = useWeather();
  const owner = state.owner.status === "owner";
  const [entries, setEntries] = useState<Entry[]>(
    BANNER.map((line) => ({ kind: "output", line })),
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  const submit = () => {
    const now = new Date();
    const result = runCommand(input, {
      name: profile.name,
      role: profile.role.en,
      location: profile.location.en,
      email: profile.email,
      apps: APPS.map((a) => ({ id: a.id, locked: !!a.ownerOnly && !owner })),
      owner,
      phase: state.phase,
      time: bangkokTime(now, true),
      weather: weather
        ? `${weather.temp}°C · ${pick(describe(weather.code), state.lang)} · Bangkok`
        : null,
      uptimeSeconds: Math.round((Date.now() - bootedAt) / 1000),
      version: VERSION_LABEL,
      files: childrenOf(state.fs, null).map((f) => ({ name: f.name, kind: f.kind, content: f.content })),
    });

    let next: Entry[] = [
      ...entries,
      { kind: "input", text: input },
      ...result.lines.map((line) => ({ kind: "output" as const, line })),
    ];
    for (const effect of result.effects) {
      if (effect.type === "clear") next = [];
      if (effect.type === "open")
        os.open(effect.app as (typeof APPS)[number]["id"]);
      if (effect.type === "close") os.close("terminal");
      if (effect.type === "lang") os.setLang(effect.lang);
      if (effect.type === "theme") os.setTheme(effect.value);
      if (effect.type === "sound") os.setSound(effect.on);
      if (effect.type === "reboot") os.dispatch({ type: "reboot", on: true });
      if (effect.type === "rm") {
        const target = childrenOf(state.fs, null).find((f) => f.name === effect.name);
        if (target) os.fsApply((fs) => toTrash(fs, [target.id]));
      }
      if (effect.type === "touch") os.fsApply((fs) => create(fs, "note", null, effect.name.includes(".") ? effect.name : `${effect.name}.txt`)[0]);
      if (effect.type === "festival") os.dispatch({ type: "festivalOverride", value: effect.value === "auto" ? null : effect.value });
      if (effect.type === "screensaver") window.dispatchEvent(new Event("kos:screensaver"));
      if (effect.type === "unlock")
        setTimeout(() => (location.href = unlockUrl), 400);
    }
    setEntries(next);
    if (input.trim()) setHistory((h) => [input, ...h].slice(0, 50));
    setInput("");
    setCursor(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { value, options } = complete(input, APPS.map((a) => a.id));
      if (value !== input) setInput(value);
      else if (options.length > 1)
        setEntries((prev) => [...prev, { kind: "input", text: input }, { kind: "output", line: { text: options.join("   "), tone: "muted" } }]);
    } else if (e.key === "Enter") {
      sound.playMechanicalClick();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(cursor + 1, history.length - 1);
      if (i >= 0) {
        setCursor(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = cursor - 1;
      setCursor(Math.max(i, -1));
      setInput(i >= 0 ? history[i] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div
      className="scroll-quiet h-full min-h-full overflow-y-auto bg-[#0d0e0c] px-5 py-4 font-mono text-[13px] leading-[1.75] text-[#d9d5cb] sm:px-6 sm:text-sm"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div role="log" aria-live="polite" aria-label="Terminal output">
        {entries.map((entry, i) =>
          entry.kind === "input" ? (
            <div key={i} className="break-words">
              <Prompt owner={owner} />
              {entry.text}
            </div>
          ) : (
            <div
              key={i}
              className={clsx(
                "whitespace-pre-wrap break-words",
                toneClass[entry.line.tone ?? "out"],
              )}
            >
              {entry.line.text || " "}
            </div>
          ),
        )}
      </div>
      <label className="flex items-center" ref={endRef}>
        <Prompt owner={owner} />
        <span className="sr-only">Command</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          className="min-w-0 grow border-0 bg-transparent p-0 font-mono text-[16px] text-[#edebe5] caret-[var(--lcd-ink)] outline-none focus-visible:outline-none sm:text-sm"
        />
      </label>
    </div>
  );
}
