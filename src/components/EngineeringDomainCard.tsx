"use client";

import React from "react";
import { profileConfig, EngineeringDomain } from "@/config/profile";
import { sound } from "@/lib/sound";

export function EngineeringDomainCard() {
  const { domains } = profileConfig;

  return (
    <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between">
      <div>
        {/* Card Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[11px] font-medium text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>Core Engineering Focus</span>
          </div>

          <span className="text-xs text-zinc-500 font-mono">
            Production & Enterprise
          </span>
        </div>

        {/* Domain Sections */}
        <div className="space-y-4">
          {domains.map((domain: EngineeringDomain, idx: number) => (
            <div
              key={domain.title}
              className={`pb-4 ${idx !== domains.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {domain.title}
                </h3>
                <span className="text-xs font-mono text-orange-400/90 font-medium">
                  {domain.badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-3">
                {domain.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                {domain.highlights.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-300">Engineering Clean & Scalable Solutions</span>
        </span>

        <a
          href="https://www.linkedin.com/in/kittipan-sankoh/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playMechanicalClick()}
          className="hover:text-white transition-colors flex items-center gap-1 text-orange-400 font-medium"
        >
          <span>Connect on LinkedIn</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}
