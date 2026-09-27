"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { sound } from "@/lib/sound";
import { appById } from "./apps";
import { useOS, type Win } from "./state";

const MENU_H = 36;
const DOCK_CLEARANCE = 96;

export function Window({
  win,
  focused,
  children,
}: {
  win: Win;
  focused: boolean;
  children: ReactNode;
}) {
  const { dispatch, close } = useOS();
  const app = appById(win.id);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null,
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (
      win.maximized ||
      e.button !== 0 ||
      (e.target as HTMLElement).closest("button")
    )
      return;
    drag.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.min(
      Math.max(d.x + e.clientX - d.px, 80 - win.w),
      window.innerWidth - 80,
    );
    const y = Math.min(
      Math.max(d.y + e.clientY - d.py, MENU_H + 4),
      window.innerHeight - 60,
    );
    dispatch({ type: "move", id: win.id, x, y });
  };
  const endDrag = () => (drag.current = null);

  const frame = win.maximized
    ? {
        left: 12,
        top: MENU_H + 12,
        width: "calc(100vw - 24px)",
        height: `calc(100vh - ${MENU_H + 12 + DOCK_CLEARANCE}px)`,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <motion.section
      aria-label={app.file}
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 6 }}
      transition={{ duration: 0.14, ease: [0.2, 0.7, 0.2, 1] }}
      onPointerDownCapture={() => dispatch({ type: "focus", id: win.id })}
      style={{ ...frame, zIndex: 10 + win.z }}
      className={clsx(
        "absolute flex flex-col overflow-hidden rounded-md border border-frame bg-panel shadow-window",
        !focused && "saturate-[.85]",
      )}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => dispatch({ type: "toggleMax", id: win.id })}
        className={clsx(
          "flex h-9 shrink-0 cursor-grab touch-none select-none items-center justify-between border-b border-line px-3 font-mono text-xs active:cursor-grabbing",
          win.id === "terminal" ? "bg-[#161614] text-[#edebe5]" : "text-ink",
        )}
      >
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label={`Close ${app.title}`}
            onClick={() => {
              sound.playMechanicalClick();
              close(win.id);
            }}
            className="size-[13px] rounded-[2px] border border-frame bg-accent hover:brightness-110"
          />
          <button
            type="button"
            aria-label={`Minimize ${app.title}`}
            onClick={() => {
              sound.playMechanicalClick();
              dispatch({ type: "minimize", id: win.id });
            }}
            className="size-[13px] rounded-[2px] border border-[#8c897f] hover:bg-[#8c897f]/30"
          />
          <button
            type="button"
            aria-label={
              win.maximized ? `Restore ${app.title}` : `Maximize ${app.title}`
            }
            onClick={() => {
              sound.playMechanicalClick();
              dispatch({ type: "toggleMax", id: win.id });
            }}
            className="size-[13px] rounded-[2px] border border-[#8c897f] hover:bg-[#8c897f]/30"
          />
        </div>
        <span
          className={clsx(
            "font-semibold tracking-[0.04em]",
            !focused && "opacity-60",
          )}
        >
          {app.file}
        </span>
        <span className="w-[51px] text-right text-[11px] opacity-50">
          {app.ownerOnly ? "private" : ""}
        </span>
      </div>
      <div
        className={clsx(
          "scroll-quiet min-h-0 grow",
          win.id === "terminal" ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}
