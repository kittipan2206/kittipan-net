"use client";

import { useMemo, type CSSProperties } from "react";
import { useOS } from "./state";
import { useWeather } from "./hooks";

// Deterministic PRNG: the same sky on server and client, and across re-renders.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isRainy = (code: number) =>
  (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

type Vars = CSSProperties & Record<`--${string}`, string>;

export function LiveWallpaper() {
  const { state } = useOS();
  const weather = useWeather();
  const dark = state.phase === "night" || state.phase === "dusk";
  const rain = weather ? isRainy(weather.code) : false;

  const stars = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 70 }, () => ({
      left: `${r() * 100}%`,
      top: `${r() * 62}%`,
      size: r() > 0.85 ? 3 : 2,
      d: `${3 + r() * 5}s`,
      delay: `${-r() * 8}s`,
    }));
  }, []);

  const clouds = useMemo(() => {
    const r = mulberry32(11);
    return Array.from({ length: 5 }, (_, i) => ({
      top: `${6 + i * 11 + r() * 6}%`,
      w: 260 + r() * 260,
      h: 70 + r() * 50,
      d: `${140 + r() * 120}s`,
      delay: `${-r() * 200}s`,
    }));
  }, []);

  const drops = useMemo(() => {
    const r = mulberry32(23);
    return Array.from({ length: 80 }, () => ({
      left: `${r() * 100}%`,
      d: `${0.7 + r() * 0.5}s`,
      delay: `${-r() * 2}s`,
    }));
  }, []);

  if (!state.live || state.wallpaper === "plain") return null;

  return (
    <div
      aria-hidden
      className="live-wallpaper pointer-events-none absolute inset-0 overflow-hidden"
    >
      {dark &&
        stars.map((s, i) => (
          <span
            key={i}
            className="lw-star"
            style={
              {
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                "--d": s.d,
                "--delay": s.delay,
                opacity: state.phase === "dusk" ? 0.5 : 1,
              } as Vars
            }
          />
        ))}
      {!dark &&
        clouds.map((c, i) => (
          <span
            key={i}
            className="lw-cloud"
            style={
              {
                top: c.top,
                width: c.w,
                height: c.h,
                "--d": c.d,
                "--delay": c.delay,
              } as Vars
            }
          />
        ))}
      {rain &&
        drops.map((d, i) => (
          <span
            key={i}
            className="lw-rain"
            style={{ left: d.left, "--d": d.d, "--delay": d.delay } as Vars}
          />
        ))}
    </div>
  );
}
