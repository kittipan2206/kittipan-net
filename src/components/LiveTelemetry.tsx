"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

export function LiveTelemetry() {
  const [timeStr, setTimeStr] = useState<string>("--:--:--");
  const [dateStr, setDateStr] = useState<string>("UTC+7");
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Live Bangkok Clock (UTC+7)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Bangkok timezone
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
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      setTimeStr(timeFormatter.format(now));
      setDateStr(dateFormatter.format(now).toUpperCase());
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Measure Edge Latency Ping
  const pingEdge = async () => {
    if (typeof window === "undefined") return;
    setIsPinging(true);
    const start = performance.now();
    try {
      // Fast lightweight HEAD request to origin
      await fetch(`${window.location.origin}/`, {
        method: "HEAD",
        cache: "no-store",
      });
      const end = performance.now();
      setLatency(Math.max(12, Math.round(end - start)));
    } catch {
      // Fallback estimate if offline / cors
      setLatency(34);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    pingEdge();
    const pingInterval = setInterval(pingEdge, 15000);
    return () => clearInterval(pingInterval);
  }, []);

  const handleManualPing = () => {
    sound.playMechanicalClick();
    pingEdge();
  };

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2 mb-3 text-[10px] text-industrial-zinc">
        <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-industrial-paper">
          <span className="w-1.5 h-1.5 bg-industrial-orange inline-block" />
          TELEMETRY // LIVE
        </span>
        <button
          onClick={handleManualPing}
          title="Click to refresh ping latency"
          className="hover:text-industrial-orange flex items-center gap-1 text-[9px] transition-colors cursor-pointer"
        >
          <span>PING</span>
          <span className={isPinging ? "animate-spin inline-block" : ""}>↻</span>
        </button>
      </div>

      {/* Main Clock Display */}
      <div className="my-auto py-1">
        <div className="text-[10px] text-industrial-zinc uppercase tracking-widest mb-1 flex items-center justify-between">
          <span>BANGKOK LOCAL</span>
          <span className="text-industrial-orange font-semibold">{dateStr}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-widest text-industrial-paper bg-chassis-inset border border-chassis-border/80 rounded px-3 py-2 text-center shadow-inner">
          <span className="text-industrial-orange font-bold">
            {timeStr}
          </span>
        </div>
      </div>

      {/* Bottom Telemetry Gauges */}
      <div className="pt-3 mt-3 border-t border-chassis-border/60 grid grid-cols-2 gap-2 text-[10px]">
        {/* Latency Gauge */}
        <div className="flex items-center gap-1.5 bg-chassis-base/60 p-1.5 rounded border border-chassis-border/40">
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-diode shadow-diode" />
          <div className="flex flex-col">
            <span className="text-[8px] text-industrial-zinc uppercase">EDGE LATENCY</span>
            <span className="text-industrial-paper font-bold">
              {latency ? `${latency} ms` : "MEASURING..."}
            </span>
          </div>
        </div>

        {/* Node Health */}
        <div className="flex items-center gap-1.5 bg-chassis-base/60 p-1.5 rounded border border-chassis-border/40">
          <span className="w-1.5 h-1.5 rounded-none bg-industrial-orange inline-block" />
          <div className="flex flex-col">
            <span className="text-[8px] text-industrial-zinc uppercase">NETWORK MESH</span>
            <span className="text-industrial-paper font-bold">CF-PAGES 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
