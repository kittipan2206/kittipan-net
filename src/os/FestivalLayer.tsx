"use client";

import { useMemo, type CSSProperties } from "react";
import { useOS } from "./state";

type Vars = CSSProperties & Record<`--${string}`, string>;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Songkran water on the glass, Loy Krathong lanterns rising, New Year dot-matrix fireworks. */
export function FestivalLayer() {
  const { state } = useOS();

  const drops = useMemo(() => {
    const r = seeded(3);
    return Array.from({ length: 34 }, () => ({
      left: `${r() * 100}%`,
      top: `${r() * 90}%`,
      size: 6 + r() * 16,
      d: `${6 + r() * 14}s`,
      delay: `${-r() * 20}s`,
    }));
  }, []);

  const lanterns = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 22 }, () => ({
      left: `${4 + r() * 92}%`,
      size: 10 + r() * 14,
      d: `${26 + r() * 30}s`,
      delay: `${-r() * 56}s`,
      sway: `${6 + r() * 10}s`,
    }));
  }, []);

  const bursts = useMemo(() => {
    const r = seeded(9);
    return Array.from({ length: 8 }, (_, i) => ({
      left: `${10 + r() * 80}%`,
      top: `${10 + r() * 45}%`,
      delay: `${i * 0.7 + r() * 0.5}s`,
      hue: i % 2 ? "var(--lcd-ink)" : "#ffd36b",
    }));
  }, []);

  if (!state.festival) return null;

  return (
    <div
      aria-hidden
      className="festival pointer-events-none absolute inset-0 overflow-hidden"
    >
      {state.festival === "songkran" &&
        drops.map((d, i) => (
          <span
            key={i}
            className="fx-drop"
            style={
              {
                left: d.left,
                top: d.top,
                width: d.size,
                height: d.size * 1.2,
                "--d": d.d,
                "--delay": d.delay,
              } as Vars
            }
          />
        ))}
      {state.festival === "loykrathong" &&
        lanterns.map((l, i) => (
          <span
            key={i}
            className="fx-lantern-track"
            style={{ left: l.left, "--d": l.d, "--delay": l.delay } as Vars}
          >
            <span
              className="fx-lantern"
              style={
                {
                  width: l.size,
                  height: l.size * 1.25,
                  "--sway": l.sway,
                } as Vars
              }
            />
          </span>
        ))}
      {state.festival === "newyear" &&
        bursts.map((b, i) => (
          <span
            key={i}
            className="fx-burst"
            style={
              {
                left: b.left,
                top: b.top,
                "--delay": b.delay,
                "--hue": b.hue,
              } as Vars
            }
          >
            {Array.from({ length: 20 }, (_, k) => (
              <span key={k} style={{ "--a": `${k * 18}deg` } as Vars} />
            ))}
          </span>
        ))}
    </div>
  );
}
