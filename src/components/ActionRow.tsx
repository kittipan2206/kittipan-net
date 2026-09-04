"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

interface ActionRowProps {
  onOpenQR: () => void;
  onNotify: (msg: string) => void;
}

export function ActionRow({ onOpenQR, onNotify }: ActionRowProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleDownloadVCard = () => {
    sound.playSuccessChime();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#ff5500", "#10b981", "#ffffff"],
    });

    const { vCard } = profileConfig;
    const vcfLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${vCard.lastName};${vCard.firstName};;;`,
      `FN:${vCard.firstName} ${vCard.lastName}`,
      `ORG:${vCard.organization}`,
      `TITLE:${vCard.title}`,
      `EMAIL;type=INTERNET;type=pref:${vCard.email}`,
      `URL:${vCard.url}`,
      `NOTE:${vCard.note}`,
      "END:VCARD",
    ];

    const blob = new Blob([vcfLines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${vCard.firstName.toLowerCase()}-${vCard.lastName.toLowerCase()}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onNotify("Contact saved (.vcf)");
  };

  const handleCopyEmail = async () => {
    sound.playSuccessChime();
    try {
      await navigator.clipboard.writeText(profileConfig.email);
      setCopiedEmail(true);
      onNotify(`Copied ${profileConfig.email}`);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      onNotify("Clipboard unavailable");
    }
  };

  const handleOpenQR = () => {
    sound.playMechanicalClick();
    onOpenQR();
  };

  return (
    <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="text-xs text-zinc-500 font-medium mb-3">
          Quick Actions
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Save Contact */}
          <button
            onClick={handleDownloadVCard}
            className="interactive-pill flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] text-center transition-all cursor-pointer group"
          >
            <span className="text-base mb-1">📇</span>
            <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
              Save Contact
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">.vcf</span>
          </button>

          {/* Scan QR Code */}
          <button
            onClick={handleOpenQR}
            className="interactive-pill flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] text-center transition-all cursor-pointer group"
          >
            <span className="text-base mb-1">📱</span>
            <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
              Scan QR
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Code</span>
          </button>

          {/* Copy Email */}
          <button
            onClick={handleCopyEmail}
            className="interactive-pill flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] text-center transition-all cursor-pointer group"
          >
            <span className="text-base mb-1">{copiedEmail ? "✓" : "✉️"}</span>
            <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
              {copiedEmail ? "Copied" : "Copy Email"}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Direct</span>
          </button>
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
        <span>Press <kbd className="bg-white/[0.06] px-1 py-0.5 rounded text-zinc-300 font-mono">V</kbd> or <kbd className="bg-white/[0.06] px-1 py-0.5 rounded text-zinc-300 font-mono">C</kbd></span>
        <span className="text-zinc-400">me@kittipan.net</span>
      </div>
    </div>
  );
}
