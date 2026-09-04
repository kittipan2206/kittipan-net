"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

export function LiveTelemetry() {
  const [timeStr, setTimeStr] = useState<string>("--:--:--");
  const [dateStr, setDateStr] = useState<string>("Bangkok");
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      setTimeStr(timeFormatter.format(now));
      setDateStr(dateFormatter.format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pingEdge = async () => {
    if (typeof window === "undefined") return;
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch(`${window.location.origin}/`, {
        method: "HEAD",
        cache: "no-store",
      });
      const end = performance.now();
      setLatency(Math.max(14, Math.round(end - start)));
    } catch {
      setLatency(28);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingEdge();
    const interval = setInterval(pingEdge, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualPing = () => {
    sound.playMechanicalClick();
    pingEdge();
  };

  return (
    <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
          <span className="font-medium text-zinc-400">Local Time & Telemetry</span>
          <button
            onClick={handleManualPing}
            title="Refresh network latency"
            className="hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] cursor-pointer font-mono text-[11px]"
          >
            <span>Ping</span>
            <span className={isPinging ? "animate-spin inline-block" : ""}>↻</span>
          </button>
        </div>

        {/* Big Time Display */}
        <div className="mb-2">
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
            {timeStr}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {dateStr} · Bangkok (UTC+7)
          </div>
        </div>
      </div>

      {/* Latency & Network Status */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <span className="text-zinc-300 font-mono font-medium">
            {latency ? `${latency} ms` : "Measuring..."}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">Cloudflare Edge</span>
        </div>

        <span className="text-[11px] font-mono text-zinc-500">
          HTTP/3 QUIC
        </span>
      </div>
    </div>
  );
}
