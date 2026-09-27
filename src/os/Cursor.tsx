"use client";

import { useEffect, useRef } from "react";
import { useOS } from "./state";

const INTERACTIVE =
  "button, a, [role=menuitem], [role=menuitemradio], [role=option], .key, [data-cursor]";
const NATIVE = "input, textarea, [contenteditable], [class*='-resize']";
const RING = 26;
const PAD = 5;

/**
 * Industrial cursor: an exact square dot + focus-bracket reticle on a spring.
 * Over interactive elements the reticle wraps the element (magnetic, slight overshoot).
 * Mouse/trackpad only; touch and reduced motion keep the system cursor.
 */
export function Cursor() {
  const { state } = useOS();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bursts = useRef<HTMLDivElement>(null);
  const enabled = state.cursor === "custom" && state.motion !== "reduced";

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!enabled || !fine || reduced) return;
    const root = document.documentElement;
    root.classList.add("kos-cursor");

    const pointer = { x: -100, y: -100 };
    // Spring state for the reticle: position + size, each with velocity.
    const s = {
      x: -100,
      y: -100,
      w: RING,
      h: RING,
      vx: 0,
      vy: 0,
      vw: 0,
      vh: 0,
    };
    let target: Element | null = null;
    let pressed = false;
    let visible = false;
    let hidden = false;
    let raf = 0;

    const spring = (
      pos: number,
      vel: number,
      goal: number,
      k: number,
      d: number,
    ) => {
      const v = (vel + (goal - pos) * k) * d;
      return [pos + v, v] as const;
    };

    const frame = () => {
      let gx = pointer.x;
      let gy = pointer.y;
      let gw = pressed ? RING * 0.7 : RING;
      let gh = gw;
      if (target?.isConnected) {
        const r = target.getBoundingClientRect();
        gw = r.width + PAD * 2 - (pressed ? 4 : 0);
        gh = r.height + PAD * 2 - (pressed ? 4 : 0);
        gx = r.left + r.width / 2;
        gy = r.top + r.height / 2;
      }
      [s.x, s.vx] = spring(s.x, s.vx, gx, 0.2, 0.68);
      [s.y, s.vy] = spring(s.y, s.vy, gy, 0.2, 0.68);
      [s.w, s.vw] = spring(s.w, s.vw, gw, 0.16, 0.66);
      [s.h, s.vh] = spring(s.h, s.vh, gh, 0.16, 0.66);
      if (ring.current) {
        ring.current.style.transform = `translate(${s.x - s.w / 2}px, ${s.y - s.h / 2}px)`;
        ring.current.style.width = `${s.w}px`;
        ring.current.style.height = `${s.h}px`;
      }
      if (dot.current)
        dot.current.style.transform = `translate(${pointer.x - 3}px, ${pointer.y - 3}px) scale(${pressed ? 0.6 : 1})`;
      raf = requestAnimationFrame(frame);
    };

    const setVisibility = () => {
      const show = visible && !hidden;
      ring.current?.classList.toggle("is-hidden", !show);
      dot.current?.classList.toggle("is-hidden", !show);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!visible) {
        s.x = pointer.x;
        s.y = pointer.y;
        visible = true;
      }
      const el = e.target as Element | null;
      hidden = !!el?.closest(NATIVE);
      const next = hidden ? null : (el?.closest(INTERACTIVE) ?? null);
      if (next !== target) {
        target = next;
        ring.current?.classList.toggle("is-locked", !!target);
      }
      setVisibility();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || hidden) return;
      pressed = true;
      // Dot-matrix burst: 8 squares fly out from the click.
      const host = bursts.current;
      if (!host) return;
      const burst = document.createElement("div");
      burst.className = "cursor-burst";
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      for (let i = 0; i < 8; i++) {
        const p = document.createElement("span");
        p.style.setProperty("--a", `${i * 45}deg`);
        burst.appendChild(p);
      }
      host.appendChild(burst);
      setTimeout(() => burst.remove(), 520);
    };
    const onUp = () => (pressed = false);
    const onLeave = () => {
      visible = false;
      setVisibility();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(frame);
    return () => {
      root.classList.remove("kos-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="kos-cursor-layer">
      <div ref={bursts} />
      <div ref={ring} className="cursor-ring is-hidden">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div ref={dot} className="cursor-dot is-hidden" />
    </div>
  );
}
