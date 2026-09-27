"use client";

import { useEffect, useRef, useState } from "react";
import { useOS } from "./state";
import { useNow } from "./hooks";
import { bangkokDate, bangkokTime } from "./sun";
import { LcdText } from "./ui";

const IDLE_MS = { off: Infinity, "1m": 60_000, "5m": 300_000 } as const;
const WAKE_EVENTS = [
  "pointermove",
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
] as const;

/** Floating dot-matrix clock after the desktop sits idle. Any input wakes it. */
export function Screensaver() {
  const { state } = useOS();
  const [active, setActive] = useState(false);
  const clock = useRef<HTMLDivElement>(null);
  const now = useNow(1000);
  const blocked = state.rebooting || state.spotlight;

  // Idle timer + manual trigger ("screensaver" command / context menu).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const idle = IDLE_MS[state.screensaver];
    const arm = () => {
      clearTimeout(timer);
      if (
        Number.isFinite(idle) &&
        !blocked &&
        window.matchMedia("(min-width: 768px)").matches
      )
        timer = setTimeout(() => setActive(true), idle);
    };
    const wake = () => {
      setActive(false);
      arm();
    };
    const start = () => setTimeout(() => setActive(true), 150);
    arm();
    WAKE_EVENTS.forEach((e) =>
      window.addEventListener(e, wake, { passive: true }),
    );
    window.addEventListener("kos:screensaver", start);
    return () => {
      clearTimeout(timer);
      WAKE_EVENTS.forEach((e) => window.removeEventListener(e, wake));
      window.removeEventListener("kos:screensaver", start);
    };
  }, [state.screensaver, blocked]);

  // DVD-logo bounce.
  useEffect(() => {
    if (!active) return;
    const el = clock.current;
    if (!el) return;
    const reduced =
      state.motion === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = Math.random() * (innerWidth - el.offsetWidth);
    let y = Math.random() * (innerHeight - el.offsetHeight);
    let vx = 0.9;
    let vy = 0.7;
    let raf = 0;
    const step = () => {
      const maxX = innerWidth - el.offsetWidth;
      const maxY = innerHeight - el.offsetHeight;
      x += vx;
      y += vy;
      if (x <= 0 || x >= maxX) vx *= -1;
      if (y <= 0 || y >= maxY) vy *= -1;
      el.style.transform = `translate(${Math.max(0, Math.min(x, maxX))}px, ${Math.max(0, Math.min(y, maxY))}px)`;
      raf = requestAnimationFrame(step);
    };
    if (reduced)
      el.style.transform = `translate(${(innerWidth - el.offsetWidth) / 2}px, ${(innerHeight - el.offsetHeight) / 2}px)`;
    else raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, state.motion]);

  if (!active) return null;
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[280] cursor-none bg-[#050505]"
    >
      <div
        ref={clock}
        className="absolute left-0 top-0 flex flex-col items-center gap-3 will-change-transform"
      >
        <LcdText className="text-[120px]" text={now ? bangkokTime(now) : "--:--"} />
        <span className="caps text-[#6b6962]">
          {now ? `${bangkokDate(now)} · Bangkok` : ""}
        </span>
      </div>
    </div>
  );
}
