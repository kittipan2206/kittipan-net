"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import { clsx } from "clsx";
import { pick, profile } from "@/config/profile";
import { useOS } from "./state";
import { useNow, useWeather } from "./hooks";
import { bangkokTime, sunProgress, sunTimes } from "./sun";
import { describe } from "./weather";
import { Caps, SunArc } from "./ui";

export function ClockWidget({ compact }: { compact?: boolean }) {
  const { state } = useOS();
  const now = useNow(1000);
  const times = now ? sunTimes(now) : null;
  const progress = now ? sunProgress(now) : null;
  const label =
    state.themePref === "auto" ? state.phase : `${state.phase} · manual`;

  return (
    <section
      aria-label="Bangkok clock"
      className={clsx(
        "lcd",
        compact ? "rounded-xl px-[18px] py-4" : "p-[18px]",
      )}
    >
      <div className="caps flex justify-between text-lcd-sub">
        <span>Bangkok · UTC+7</span>
        <span>{label}</span>
      </div>
      <div
        className={clsx(
          "flex",
          compact ? "mt-2 items-end justify-between gap-3" : "flex-col",
        )}
      >
        <time
          className={clsx(
            "lcd-digits",
            compact ? "text-[58px]" : "my-3 text-[72px]",
          )}
          suppressHydrationWarning
        >
          {now ? bangkokTime(now) : "--:--"}
        </time>
        <div className={compact ? "w-[84px] shrink-0 pb-1" : ""}>
          <SunArc progress={progress} />
        </div>
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-lcd-sub">
        <span>RISE {times ? bangkokTime(times.sunrise) : "--:--"}</span>
        <span>SET {times ? bangkokTime(times.sunset) : "--:--"}</span>
      </div>
    </section>
  );
}

function WeatherIcon({ code, night }: { code: number; night: boolean }) {
  const props = { size: 38, strokeWidth: 1.4, "aria-hidden": true };
  if (code === 0) return night ? <Moon {...props} /> : <Sun {...props} />;
  if (code <= 2) return <CloudSun {...props} />;
  if (code === 3) return <Cloud {...props} />;
  if (code <= 48) return <CloudFog {...props} />;
  if (code <= 57) return <CloudDrizzle {...props} />;
  if (code <= 82) return <CloudRain {...props} />;
  return <CloudLightning {...props} />;
}

export function WeatherWidget({ compact }: { compact?: boolean }) {
  const { state } = useOS();
  const weather = useWeather();
  const night = state.phase === "night" || state.phase === "dusk";
  const text = weather
    ? pick(describe(weather.code), state.lang)
    : state.lang === "th"
      ? "กำลังโหลด…"
      : "Loading…";

  if (compact) {
    return (
      <section
        aria-label="Weather"
        className="panel flex flex-col gap-1.5 rounded-xl p-3.5"
      >
        <Caps>Weather</Caps>
        <span className="font-dot text-[40px] font-extrabold leading-none text-ink">
          {weather ? `${weather.temp}°` : "--°"}
        </span>
        <span className="font-sans text-[13px] text-sub">
          {text}
        </span>
      </section>
    );
  }
  return (
    <section
      aria-label="Weather"
      className="panel flex items-center gap-4 px-[18px] py-4 text-ink"
    >
      {weather ? (
        <WeatherIcon code={weather.code} night={night} />
      ) : (
        <Cloud size={38} strokeWidth={1.4} aria-hidden />
      )}
      <div className="flex min-w-0 grow flex-col gap-1">
        <span className="font-dot text-[34px] font-extrabold leading-none">
          {weather ? `${weather.temp}°` : "--°"}
        </span>
        <span className="truncate font-sans text-xs text-sub">{text}</span>
      </div>
      <div className="flex flex-col items-end gap-1 self-stretch">
        <Caps>{pick(profile.location, state.lang)}</Caps>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto font-mono text-[10px] text-sub hover:text-ink"
        >
          open-meteo
        </a>
      </div>
    </section>
  );
}

export function NowWidget({ compact }: { compact?: boolean }) {
  const { state } = useOS();
  const updated = new Date(profile.now.updated).toLocaleDateString(
    state.lang === "th" ? "th-TH" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
  return (
    <section
      aria-label="Now"
      className={clsx(
        "panel flex flex-col gap-2 text-ink",
        compact ? "rounded-xl p-3.5" : "px-[18px] py-4",
      )}
    >
      <div className="flex justify-between">
        <Caps>Now</Caps>
        {!compact && <Caps>{updated}</Caps>}
      </div>
      <p
        className={clsx(
          "m-0 font-sans font-semibold leading-snug",
          compact ? "text-sm" : "text-[15px]",
        )}
      >
        {pick(profile.now.text, state.lang)}
      </p>
    </section>
  );
}
