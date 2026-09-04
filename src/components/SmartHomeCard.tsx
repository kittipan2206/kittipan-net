"use client";

import React from "react";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

export function SmartHomeCard() {
  const { smartHomeNode } = profileConfig;
  if (!smartHomeNode) return null;

  const handleLaunch = () => {
    sound.playMechanicalClick();
  };

  return (
    <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Home Assistant OS • Online</span>
          </div>

          <span className="text-xs font-mono text-zinc-500">
            Hyper-V Isolated
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          {smartHomeNode.label}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-xl">
          {smartHomeNode.description}
        </p>
      </div>

      <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            {smartHomeNode.specs.virtualization}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            {smartHomeNode.specs.core}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            Zero Trust
          </span>
        </div>

        <a
          href={smartHomeNode.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLaunch}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-all shadow-md group shrink-0"
        >
          <span>Access Portal</span>
          <span className="group-hover:translate-x-0.5 transition-transform text-zinc-700">↗</span>
          <kbd className="hidden sm:inline-block text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-mono">
            H
          </kbd>
        </a>
      </div>
    </div>
  );
}
