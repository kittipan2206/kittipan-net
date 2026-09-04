"use client";

import React from "react";
import { profileConfig, TechItem } from "@/config/profile";

export function TechBadges() {
  const { techStack, interests } = profileConfig;

  return (
    <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="text-xs text-zinc-500 font-medium mb-3">
          Technologies & Tools
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-5">
          {techStack.map((item: TechItem) => (
            <div
              key={item.name}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between"
            >
              <span className="font-medium text-zinc-200 text-xs">
                {item.name}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                {item.detail}
              </span>
            </div>
          ))}
        </div>

        {/* Interests & Hobbies */}
        <div className="text-xs text-zinc-500 font-medium mb-2">
          Interests & Personal Projects
        </div>
        <div className="flex flex-wrap gap-1.5">
          {interests.map((interest: string) => (
            <span
              key={interest}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-zinc-400"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
        <span>Software Engineering</span>
        <span className="text-zinc-400 font-mono">Production Ready</span>
      </div>
    </div>
  );
}
