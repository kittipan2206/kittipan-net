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

    // Trigger celebratory particle confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#FF4F00", "#22C55E", "#EDEDED"],
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

    onNotify("VCARD EXPORTED // CONTACT SAVED");
  };

  const handleCopyEmail = async () => {
    sound.playSuccessChime();
    try {
      await navigator.clipboard.writeText(profileConfig.email);
      setCopiedEmail(true);
      onNotify(`COPIED // ${profileConfig.email}`);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      onNotify("ERROR // CLIPBOARD UNAVAILABLE");
    }
  };

  const handleOpenQR = () => {
    sound.playMechanicalClick();
    onOpenQR();
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full font-mono">
      {/* Save Contact (.vcf) */}
      <button
        onClick={handleDownloadVCard}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer relative"
      >
        <span className="text-[10px] font-mono text-industrial-orange mb-1 tracking-wider uppercase font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-industrial-orange rounded-none inline-block" />
          KEY // 01
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide group-hover:text-white transition-colors">
          Save Contact
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-mono text-industrial-zinc">.vcf</span>
          <kbd className="text-[8px] bg-chassis-inset px-1 rounded border border-chassis-border text-industrial-zinc">
            V
          </kbd>
        </div>
      </button>

      {/* Optical QR Code */}
      <button
        onClick={handleOpenQR}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer relative"
      >
        <span className="text-[10px] font-mono text-industrial-zinc mb-1 tracking-wider uppercase font-bold">
          KEY // 02
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide group-hover:text-white transition-colors">
          Scan QR Code
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-mono text-industrial-zinc">optical</span>
          <kbd className="text-[8px] bg-chassis-inset px-1 rounded border border-chassis-border text-industrial-zinc">
            Q
          </kbd>
        </div>
      </button>

      {/* Copy Email */}
      <button
        onClick={handleCopyEmail}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer relative"
      >
        <span className="text-[10px] font-mono text-industrial-zinc mb-1 tracking-wider uppercase font-bold">
          {copiedEmail ? (
            <span className="text-industrial-diode">COPIED</span>
          ) : (
            "KEY // 03"
          )}
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide group-hover:text-white transition-colors">
          {copiedEmail ? "Copied" : "Copy Email"}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-mono text-industrial-zinc">direct</span>
          <kbd className="text-[8px] bg-chassis-inset px-1 rounded border border-chassis-border text-industrial-zinc">
            C
          </kbd>
        </div>
      </button>
    </div>
  );
}
