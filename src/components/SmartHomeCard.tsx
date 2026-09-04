"use client";

import React from "react";
import { profileConfig } from "@/config/profile";

export function SmartHomeCard() {
  const { smartHomeNode } = profileConfig;

  return (
    <div className="w-full chassis-box rounded p-4 mb-6 relative overflow-hidden bg-chassis-module border border-chassis-border">
      {/* Top Rackmount Ear / Module Header */}
      <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2.5 mb-3 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-industrial-orange inline-block" />
          <span className="text-industrial-paper font-bold tracking-wider">
            {smartHomeNode.nodeId}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-chassis-inset border border-chassis-border text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-industrial-diode shadow-diode" />
          <span className="text-industrial-diode font-semibold tracking-wider">
            {smartHomeNode.status}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-industrial-paper tracking-wide font-sans uppercase">
              {smartHomeNode.label}
            </h3>
          </div>
          <p className="text-xs font-mono text-industrial-orange tracking-wide">
            https://{smartHomeNode.subtext}
          </p>
        </div>

        {/* Launch Hardware Button */}
        <a
          href={smartHomeNode.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-tactile inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded bg-chassis-base border border-chassis-border text-industrial-paper text-xs font-mono font-semibold tracking-wide hover:border-industrial-orange transition-colors shrink-0"
        >
          <span>ACCESS PORT</span>
          <span className="text-industrial-orange">→</span>
        </a>
      </div>

      {/* Telemetry Spec Strip (Engraved bottom plate) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 border-t border-chassis-border/60 text-[10px] font-mono text-industrial-zinc">
        <div className="flex items-center gap-1.5">
          <span className="text-chassis-highlight font-bold">CORE:</span>
          <span className="text-industrial-paper">{smartHomeNode.core}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-chassis-highlight font-bold">HOST:</span>
          <span className="text-industrial-paper">{smartHomeNode.host}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:justify-end">
          <span className="text-chassis-highlight font-bold">PERIMETER:</span>
          <span className="text-industrial-paper">Zero Trust</span>
        </div>
      </div>
    </div>
  );
}
