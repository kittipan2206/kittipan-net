"use client";

import React, { useState } from "react";
import { profileConfig } from "@/config/profile";

interface ActionRowProps {
  onOpenQR: () => void;
  onNotify: (msg: string) => void;
}

export function ActionRow({ onOpenQR, onNotify }: ActionRowProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleDownloadVCard = () => {
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
    try {
      await navigator.clipboard.writeText(profileConfig.email);
      setCopiedEmail(true);
      onNotify(`COPIED // ${profileConfig.email}`);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      onNotify("ERROR // CLIPBOARD UNAVAILABLE");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-full mb-6">
      {/* Save Contact (.vcf) */}
      <button
        onClick={handleDownloadVCard}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer"
      >
        <span className="text-[10px] font-mono text-industrial-orange mb-1 tracking-wider uppercase font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-industrial-orange rounded-none inline-block" />
          KEY // 01
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide">
          Save Contact
        </span>
        <span className="text-[9px] font-mono text-industrial-zinc mt-0.5">.vcf export</span>
      </button>

      {/* Optical QR Code */}
      <button
        onClick={onOpenQR}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer"
      >
        <span className="text-[10px] font-mono text-industrial-zinc mb-1 tracking-wider uppercase font-bold">
          KEY // 02
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide">
          Scan QR Code
        </span>
        <span className="text-[9px] font-mono text-industrial-zinc mt-0.5">optical spec</span>
      </button>

      {/* Copy Email */}
      <button
        onClick={handleCopyEmail}
        className="btn-tactile flex flex-col items-center justify-center py-3 px-2 rounded bg-chassis-module border border-chassis-border text-industrial-paper text-center group cursor-pointer"
      >
        <span className="text-[10px] font-mono text-industrial-zinc mb-1 tracking-wider uppercase font-bold">
          {copiedEmail ? (
            <span className="text-industrial-diode">COPIED</span>
          ) : (
            "KEY // 03"
          )}
        </span>
        <span className="text-xs font-mono font-semibold tracking-wide">
          {copiedEmail ? "Copied" : "Copy Email"}
        </span>
        <span className="text-[9px] font-mono text-industrial-zinc mt-0.5">me@kittipan.net</span>
      </button>
    </div>
  );
}
