"use client";

import React from "react";
import { profileConfig, SystemSpec } from "@/config/profile";

export function TechBadges() {
  const { systemSpecs } = profileConfig;

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between font-mono">
      {/* Silkscreen Header */}
      <div>
        <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2 mb-2.5 text-[10px] text-industrial-zinc">
          <span className="font-bold tracking-wider uppercase flex items-center gap-1.5 text-industrial-paper">
            <span className="w-1.5 h-1.5 bg-industrial-orange inline-block" />
            TOPOLOGY & SILKSCREEN SPEC
          </span>
          <span>REV // 2026</span>
        </div>

        {/* Grid of Technical Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {systemSpecs.map((spec: SystemSpec) => (
            <div
              key={spec.key}
              className="flex items-center justify-between py-1.5 px-2.5 rounded bg-chassis-inset border border-chassis-border/60 text-[11px]"
            >
              <span className="text-industrial-zinc font-semibold text-[9px] uppercase tracking-wide">
                {spec.key}
              </span>
              <span className="text-industrial-paper font-medium text-[10px]">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
