"use client";

import type { ReactNode } from "react";
import { sound } from "@/lib/sound";
import { useOS, type MotionPref, type ThemePref } from "../state";
import { useNow } from "../hooks";
import { bangkokTime, sunTimes } from "../sun";
import { Caps } from "../ui";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="segmented">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => {
            sound.playToggleClick(true);
            onChange(o);
          }}
          className="font-mono uppercase"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-line py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[13px] font-semibold text-ink">
          {title}
        </span>
        <span className="font-sans text-xs text-sub">{hint}</span>
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const { state, setSound, setLang, setTheme, setMotion } = useOS();
  const now = useNow(60_000);
  const times = now ? sunTimes(now) : null;

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <section className="panel rounded-xl px-5 py-1">
        <Row
          title="Sound"
          hint="Keyboard clicks and chimes, generated live. Off by default."
        >
          <Segmented
            label="Sound"
            value={state.sound ? "on" : "off"}
            options={["off", "on"]}
            onChange={(v) => setSound(v === "on")}
          />
        </Row>
        <Row
          title="Language"
          hint="Content language. System text stays English."
        >
          <Segmented
            label="Language"
            value={state.lang}
            options={["th", "en"]}
            onChange={setLang}
          />
        </Row>
        <Row title="Lighting" hint="Auto follows the real sun over Bangkok.">
          <Segmented<ThemePref>
            label="Lighting"
            value={state.themePref}
            options={["auto", "dawn", "day", "dusk", "night"]}
            onChange={setTheme}
          />
        </Row>
        <Row title="Motion" hint="Reduce animations everywhere.">
          <Segmented<MotionPref>
            label="Motion"
            value={state.motion}
            options={["system", "reduced"]}
            onChange={setMotion}
          />
        </Row>
      </section>

      <section className="lcd grid grid-cols-2 gap-x-6 gap-y-3 p-5 font-mono text-xs sm:grid-cols-3">
        {[
          ["System", "kittipan OS 2.0"],
          ["Lighting now", state.phase],
          [
            "Sunrise · sunset",
            times
              ? `${bangkokTime(times.sunrise)} · ${bangkokTime(times.sunset)}`
              : "--",
          ],
          ["Host", "Cloudflare edge"],
          ["Kernel", "Next.js 15"],
          ["Running cost", "0 THB / month"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <span className="caps text-lcd-sub">{k}</span>
            <span className="text-lcd-text">{v}</span>
          </div>
        ))}
      </section>
      <Caps className="text-center">preferences stay on this device</Caps>
    </div>
  );
}
