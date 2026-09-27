"use client";

import type { ReactNode } from "react";
import { sound } from "@/lib/sound";
import {
  useOS,
  type Accent,
  type MotionPref,
  type Screensaver,
  type ThemePref,
  type Wallpaper,
} from "../state";
import { useNow } from "../hooks";
import { bangkokTime, sunTimes } from "../sun";
import { BUILT_AT, COMMIT, VERSION } from "../version";
import { Caps } from "../ui";

const ACCENT_SWATCH: Record<Accent, string> = {
  orange: "#ff5500",
  green: "#3fcf6e",
  blue: "#2f7bff",
};

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  swatch,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  swatch?: Record<string, string>;
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
          className="flex items-center gap-1.5 font-mono uppercase"
        >
          {swatch && (
            <span
              className="size-2 rounded-full"
              style={{ background: swatch[o] }}
              aria-hidden
            />
          )}
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
  const { state, setPrefs, setSound, setLang, setTheme, setMotion } = useOS();
  const now = useNow(60_000);
  const times = now ? sunTimes(now) : null;

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <Caps>General</Caps>
      <section className="panel -mt-3 rounded-xl px-5 py-1">
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
        <Row title="Motion" hint="Reduce animations everywhere.">
          <Segmented<MotionPref>
            label="Motion"
            value={state.motion}
            options={["system", "reduced"]}
            onChange={setMotion}
          />
        </Row>
      </section>

      <Caps>Appearance</Caps>
      <section className="panel -mt-3 rounded-xl px-5 py-1">
        <Row title="Lighting" hint="Auto follows the real sun over Bangkok.">
          <Segmented<ThemePref>
            label="Lighting"
            value={state.themePref}
            options={["auto", "dawn", "day", "dusk", "night"]}
            onChange={setTheme}
          />
        </Row>
        <Row
          title="Accent"
          hint="The one color of the system: keys, LEDs and LCD digits."
        >
          <Segmented<Accent>
            label="Accent"
            value={state.accent}
            options={["orange", "green", "blue"]}
            swatch={ACCENT_SWATCH}
            onChange={(accent) => setPrefs({ accent })}
          />
        </Row>
        <Row
          title="Wallpaper"
          hint="Sky follows the lighting; plain is a flat chassis."
        >
          <Segmented<Wallpaper>
            label="Wallpaper"
            value={state.wallpaper}
            options={["sky", "plain"]}
            onChange={(wallpaper) => setPrefs({ wallpaper })}
          />
        </Row>
        <Row
          title="Live wallpaper"
          hint="Stars at night, clouds by day, rain when it rains in Bangkok."
        >
          <Segmented
            label="Live wallpaper"
            value={state.live ? "on" : "off"}
            options={["off", "on"]}
            onChange={(v) => setPrefs({ live: v === "on" })}
          />
        </Row>
        <Row
          title="Screensaver"
          hint="Floating clock after the desktop sits idle."
        >
          <Segmented<Screensaver>
            label="Screensaver"
            value={state.screensaver}
            options={["off", "1m", "5m"]}
            onChange={(screensaver) => setPrefs({ screensaver })}
          />
        </Row>
      </section>

      <Caps>System</Caps>
      <section className="lcd -mt-3 grid grid-cols-2 gap-x-6 gap-y-3 p-5 font-mono text-xs sm:grid-cols-3">
        {[
          ["Version", VERSION],
          ["Build", `${COMMIT}${BUILT_AT ? ` · ${BUILT_AT}` : ""}`],
          ["Lighting now", state.phase],
          [
            "Sunrise · sunset",
            times
              ? `${bangkokTime(times.sunrise)} · ${bangkokTime(times.sunset)}`
              : "--",
          ],
          ["Host", "Cloudflare edge"],
          ["Running cost", "0 THB / month"],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <span className="caps text-lcd-sub">{k}</span>
            <span className="text-lcd-text">{v}</span>
          </div>
        ))}
      </section>
      <a
        href="https://github.com/kittipan2206/kittipan-net/blob/main/CHANGELOG.md"
        target="_blank"
        rel="noopener noreferrer"
        className="self-center font-mono text-[11px] text-sub underline hover:text-ink"
      >
        What&apos;s new in {VERSION}
      </a>
    </div>
  );
}
