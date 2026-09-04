"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, ExternalLink, ShieldCheck, Cpu } from "lucide-react";
import { profileConfig } from "@/config/profile";

export function SmartHomeCard() {
  const { smartHome } = profileConfig;

  return (
    <motion.a
      href={smartHome.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="group relative block w-full rounded-2xl p-4 sm:p-5 overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#121c2e] via-[#0d1624] to-[#0a0e1a] shadow-xl hover:border-cyan-400/60 transition-all duration-300 hover:shadow-cyan-glow"
    >
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition duration-500" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition duration-500" />

      <div className="relative z-10">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  {smartHome.title}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {smartHome.statusText}
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-400/80">{smartHome.subtext}</p>
            </div>
          </div>

          <div className="p-2 rounded-lg text-gray-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-300 mb-3 leading-relaxed">
          {smartHome.description}
        </p>

        {/* Specs Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Hyper-V Host
          </span>
          <span className="text-gray-600">•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Cloudflare Zero Trust
          </span>
        </div>
      </div>
    </motion.a>
  );
}
