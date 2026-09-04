"use client";

import React from "react";
import { profileConfig } from "@/config/profile";

export function ProfileHeader() {
  return (
    <div className="w-full h-full p-6 flex flex-col justify-between">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-zinc-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span>{profileConfig.role}</span>
          <span className="text-zinc-600">·</span>
          <span>{profileConfig.location}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          {profileConfig.name}
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
          {profileConfig.statement}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>{profileConfig.handle}</span>
        <span>{profileConfig.timezone}</span>
      </div>
    </div>
  );
}
