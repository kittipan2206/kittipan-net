"use client";

import React from "react";
import { profileConfig } from "@/config/profile";

export function ProfileHeader() {
  return (
    <header className="w-full mb-6 text-left">
      {/* Chassis Top Specimen Bar */}
      <div className="flex items-center justify-between border-b border-chassis-border pb-3 mb-5 text-[11px] font-mono text-industrial-zinc">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-industrial-orange inline-block" />
          <span className="tracking-wider text-industrial-paper font-semibold">
            {profileConfig.serialNumber}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-industrial-diode opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-industrial-diode shadow-diode" />
          </span>
          <span className="text-industrial-diode font-semibold tracking-wider">
            STATUS // ACTIVE
          </span>
        </div>
      </div>

      {/* Main Nameplate Identity */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
        <h1 className="text-2xl sm:text-3xl font-black text-industrial-paper tracking-tight uppercase">
          {profileConfig.name}
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-industrial-orange">
          <span>{profileConfig.handle}</span>
          <span className="text-chassis-border">/</span>
          <span className="text-industrial-zinc">{profileConfig.timezone}</span>
        </div>
      </div>

      {/* Role / Discipline */}
      <div className="text-xs sm:text-sm font-mono text-industrial-zinc tracking-wide uppercase mb-3 flex items-center gap-2">
        <span className="text-industrial-paper font-semibold">{profileConfig.role}</span>
        <span className="text-chassis-border">/</span>
        <span>{profileConfig.location}</span>
      </div>

      {/* Engineering Statement */}
      <p className="text-xs sm:text-sm text-[#A0A5B5] leading-relaxed max-w-lg font-sans border-l-2 border-industrial-orange/60 pl-3 py-0.5">
        {profileConfig.statement}
      </p>
    </header>
  );
}
