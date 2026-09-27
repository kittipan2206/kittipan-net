"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";

type KeyProps = ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean };

/** Keycap button — the one button primitive of kittipan OS. */
export const Key = forwardRef<HTMLButtonElement, KeyProps>(function Key(
  { accent, className, onClick, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={clsx("key", accent && "key-accent", className)}
      onClick={(e) => {
        sound.playMechanicalClick();
        onClick?.(e);
      }}
      {...rest}
    />
  );
});

// 5×7 dot-matrix "k" — the kittipan OS mark.
const K_GLYPH = ["10000", "10010", "10100", "11000", "10100", "10010", "10001"];

export function Logo({
  size = 28,
  dot = "#161616",
  plate = "var(--accent)",
}: {
  size?: number;
  dot?: string;
  plate?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill={plate} />
      {K_GLYPH.flatMap((row, y) =>
        [...row].map((bit, x) =>
          bit === "1" ? (
            <circle
              key={`${x}-${y}`}
              cx={8 + x * 3}
              cy={5 + y * 3}
              r="1.15"
              fill={dot}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/** LCD text with the unlit "8" segments glowing faintly behind it. */
export function LcdText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={clsx("lcd-stack", className)}>
      <span className="lcd-digits lcd-ghost" aria-hidden>
        {text.replace(/[0-9]/g, "8")}
      </span>
      <span className="lcd-digits">{text}</span>
    </span>
  );
}

export function Caps({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx("caps font-mono text-sub", className)}>
      {children}
    </span>
  );
}

/** Sun (or moon) on an arc; progress 0 = sunrise, 1 = sunset, null = night. */
export function SunArc({
  progress,
  width = 264,
  height = 92,
}: {
  progress: number | null;
  width?: number;
  height?: number;
}) {
  const pad = 12;
  const cx = width / 2;
  const cy = height - 8;
  const rx = width / 2 - pad;
  const ry = height - 20;
  const theta = Math.PI * (1 - (progress ?? 0));
  const sx = cx + rx * Math.cos(theta);
  const sy = cy - ry * Math.sin(theta);
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        progress === null
          ? "The sun is down in Bangkok"
          : "Sun position over Bangkok"
      }
    >
      <path
        d={`M${pad} ${cy} A${rx} ${ry} 0 0 1 ${width - pad} ${cy}`}
        fill="none"
        stroke="var(--lcd-line)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />
      <line x1="4" y1={cy} x2={width - 4} y2={cy} stroke="var(--lcd-line)" />
      {progress === null ? (
        <circle
          cx={width * 0.27}
          cy={height * 0.38}
          r="7"
          fill="none"
          stroke="var(--lcd-text)"
          strokeWidth="1.5"
        />
      ) : (
        <>
          <circle cx={sx} cy={sy} r="14" fill="var(--lcd-ink)" opacity="0.18" />
          <circle cx={sx} cy={sy} r="7" fill="var(--lcd-ink)" />
        </>
      )}
    </svg>
  );
}
