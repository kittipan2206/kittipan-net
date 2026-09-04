"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { profileConfig, TechItem } from "@/config/profile";

export function TechBadges() {
  const { techStack } = profileConfig;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="w-full rounded-2xl p-4 bg-white/[0.02] border border-white/5 mb-8"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Homelab & Tech Stack
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {techStack.map((tech: TechItem) => (
          <span
            key={tech.name}
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-300 transition-colors"
          >
            {tech.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
