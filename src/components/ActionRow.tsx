"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, QrCode, Mail, Check } from "lucide-react";
import confetti from "canvas-confetti";
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

    // Delightful celebration effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#00F0FF", "#10B981", "#3B82F6", "#FFFFFF"],
      });
    } catch {
      // ignore
    }

    onNotify("Contact card downloaded (.vcf)!");
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profileConfig.email);
      setCopiedEmail(true);
      onNotify(`Copied ${profileConfig.email}`);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      onNotify("Failed to copy email");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-3 gap-2.5 w-full mb-5"
    >
      {/* Save Contact (.vcf) */}
      <button
        onClick={handleDownloadVCard}
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-gray-200 transition-all duration-200 hover:-translate-y-0.5 group"
      >
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
          <UserPlus className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-medium tracking-tight">Save Contact</span>
      </button>

      {/* Share / QR Code */}
      <button
        onClick={onOpenQR}
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-gray-200 transition-all duration-200 hover:-translate-y-0.5 group"
      >
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
          <QrCode className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-medium tracking-tight">QR Code</span>
      </button>

      {/* Copy Email */}
      <button
        onClick={handleCopyEmail}
        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-gray-200 transition-all duration-200 hover:-translate-y-0.5 group"
      >
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
          {copiedEmail ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </div>
        <span className="text-[11px] font-medium tracking-tight">
          {copiedEmail ? "Copied!" : "Copy Email"}
        </span>
      </button>
    </motion.div>
  );
}
