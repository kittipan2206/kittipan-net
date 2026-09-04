"use client";

import React from "react";
import { profileConfig, SystemSpec } from "@/config/profile";

export function TechBadges() {
  const { systemSpecs } = profileConfig;

  return (
    <div className="w-full mb-6 chassis-box rounded p-3.5 bg-chassis-inset border border-chassis-border/80">
      {/* Silkscreen Header */}
      <div className="flex items-center justify-between border-b border-chassis-border/60 pb-2 mb-2.5 text-[10px] font-mono text-industrial-zinc">
        <span className="font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-industrial-orange inline-block" />
          SYSTEM TOPOLOGY & INFRASTRUCTURE SPEC
        </span>
        <span>REV // 2026.09</span>
      </div>

      {/* Grid of Technical Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        {systemSpecs.map((spec: SystemSpec) => (
          <div
            key={spec.key}
            className="flex items-center justify-between py-1.5 px-2.5 rounded bg-chassis-module/70 border border-chassis-border/40 text-[11px]"
          >
            <span className="text-industrial-zinc font-semibold text-[10px]">
              {spec.key}
            </span>
            <span className="text-industrial-paper font-medium">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
