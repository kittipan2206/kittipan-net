"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Sparkles } from "lucide-react";
import { profileConfig } from "@/config/profile";

export function ProfileHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center pt-8 pb-6 px-4"
    >
      {/* Avatar Container with glowing rings */}
      <div className="relative mb-5 group">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 opacity-70 blur-md group-hover:opacity-100 transition duration-500 animate-pulse-glow" />
        
        <div className="relative w-28 h-28 rounded-full bg-[#111625] border-2 border-white/20 p-1 flex items-center justify-center overflow-hidden shadow-2xl">
          {profileConfig.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileConfig.avatarUrl}
              alt={profileConfig.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-30" />
              <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-white to-emerald-400">
                KS
              </span>
              <span className="text-[9px] font-mono tracking-wider text-cyan-400/80 mt-0.5 uppercase">
                Systems
              </span>
            </div>
          )}
        </div>

        {/* Floating status badge */}
        <div className="absolute bottom-0 right-1 translate-x-1 translate-y-1 bg-[#0d121f] border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute left-2" />
          <span className="text-[10px] font-mono text-emerald-300 font-medium pl-2.5">ONLINE</span>
        </div>
      </div>

      {/* Name and Verified Badge */}
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {profileConfig.name}
        </h1>
        <div className="text-cyan-400" title="Verified Personal Entity">
          <CheckCircle className="w-5 h-5 fill-cyan-400/20" />
        </div>
      </div>

      {/* Handle */}
      <p className="text-sm font-mono text-cyan-400/90 mb-3 tracking-wide">
        {profileConfig.handle}
      </p>

      {/* Location Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-gray-300 mb-4 backdrop-blur-sm">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        <span>{profileConfig.location}</span>
      </div>

      {/* Tagline / Subtitle */}
      <p className="text-sm sm:text-base font-medium text-gray-200 max-w-md mx-auto mb-2 leading-relaxed">
        {profileConfig.title}
      </p>

      {/* Short Bio */}
      <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
        {profileConfig.bio}
      </p>
    </motion.header>
  );
}
