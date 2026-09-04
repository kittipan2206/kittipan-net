"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { EngineeringDomainCard } from "@/components/EngineeringDomainCard";
import { SocialLinks } from "@/components/SocialLinks";
import { TechBadges } from "@/components/TechBadges";
import { QRCodeModal } from "@/components/QRCodeModal";
import { LiveTelemetry } from "@/components/LiveTelemetry";
import { CommandPalette } from "@/components/CommandPalette";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Toast } from "@/components/Toast";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

export default function Home() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSoundActive, setIsSoundActive] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setIsSoundActive(sound.isEnabled());
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setIsSoundActive(newState);
    showNotification(newState ? "Audio feedback enabled" : "Audio feedback muted");
  };

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

    showNotification("Contact saved (.vcf)");
  };

  const handleCopyEmail = async () => {
    sound.playSuccessChime();
    try {
      await navigator.clipboard.writeText(profileConfig.email);
      setCopiedEmail(true);
      showNotification(`Copied ${profileConfig.email}`);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      showNotification("Clipboard unavailable");
    }
  };

  // Global Keyboard Shortcuts (Cmd+K, L, G, C, Q, V, M)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      if (!isCommandOpen && !isQROpen && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "m") {
          e.preventDefault();
          handleToggleSound();
        } else if (key === "q") {
          e.preventDefault();
          sound.playMechanicalClick();
          setIsQROpen(true);
        } else if (key === "v") {
          e.preventDefault();
          handleDownloadVCard();
        } else if (key === "c") {
          e.preventDefault();
          handleCopyEmail();
        } else if (key === "l") {
          e.preventDefault();
          sound.playMechanicalClick();
          window.open("https://www.linkedin.com/in/kittipan-sankoh/", "_blank");
        } else if (key === "g") {
          e.preventDefault();
          sound.playMechanicalClick();
          window.open("https://github.com/kittipan2206", "_blank");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isCommandOpen, isQROpen]);

  return (
    <div className="min-h-screen ambient-mesh text-zinc-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-300">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#08090c]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Identity Mark */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(255,85,0,0.6)]" />
            <span className="font-mono text-sm font-semibold text-white tracking-tight">
              kittipan.net
            </span>
            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline-block">
              Software & Mobile Engineer
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                sound.playMechanicalClick();
                setIsCommandOpen(true);
              }}
              className="interactive-pill flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <span className="text-zinc-400">Search</span>
              <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 font-mono border border-white/[0.06]">
                ⌘K
              </kbd>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isSoundActive ? "Mute sound effects" : "Enable sound effects"}
              className={`interactive-pill p-1.5 px-2.5 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSoundActive
                  ? "bg-white/[0.06] border-orange-500/40 text-orange-400"
                  : "bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>{isSoundActive ? "🔊" : "🔇"}</span>
              <span className="text-[10px] font-mono hidden sm:inline">
                {isSoundActive ? "FX" : "MUTED"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* HERO SECTION */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-zinc-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>{profileConfig.role}</span>
                <span className="text-zinc-600">·</span>
                <span>Bangkok, TH</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                {profileConfig.name}
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl font-normal">
                {profileConfig.statement}
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleDownloadVCard}
              className="interactive-pill inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 font-medium text-sm hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
            >
              <span>Save Contact</span>
              <kbd className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-mono">
                V
              </kbd>
            </button>

            <button
              onClick={handleCopyEmail}
              className="interactive-pill inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
              <span className="text-xs text-zinc-500 font-mono">me@kittipan.net</span>
              <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                C
              </kbd>
            </button>

            <a
              href="https://www.linkedin.com/in/kittipan-sankoh/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playMechanicalClick()}
              className="interactive-pill inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-zinc-200 hover:text-white transition-all"
            >
              <span>LinkedIn</span>
              <span className="text-zinc-500 text-xs">↗</span>
              <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                L
              </kbd>
            </a>

            <a
              href="https://github.com/kittipan2206"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playMechanicalClick()}
              className="interactive-pill inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-zinc-300 hover:text-white transition-all"
            >
              <span>GitHub</span>
              <span className="text-zinc-500 text-xs">↗</span>
              <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                G
              </kbd>
            </a>

            <button
              onClick={() => {
                sound.playMechanicalClick();
                setIsQROpen(true);
              }}
              className="interactive-pill inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <span>QR Code</span>
              <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400 font-mono">
                Q
              </kbd>
            </button>
          </div>
        </section>

        {/* BENTO GRID MATRIX */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Bento Cell 1: Core Engineering Domains (2 cols) */}
          <SpotlightCard className="md:col-span-2">
            <EngineeringDomainCard />
          </SpotlightCard>

          {/* Bento Cell 2: Live Telemetry & Bangkok Clock (1 col) */}
          <SpotlightCard className="md:col-span-1">
            <LiveTelemetry />
          </SpotlightCard>

          {/* Bento Cell 3: Channels & Professional Network (2 cols) */}
          <SpotlightCard className="md:col-span-2">
            <SocialLinks />
          </SpotlightCard>

          {/* Bento Cell 4: Tech Stack & Interests (1 col) */}
          <SpotlightCard className="md:col-span-1">
            <TechBadges />
          </SpotlightCard>
        </section>

        {/* Minimal Editorial Footer */}
        <footer className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-400">kittipan.net</span>
            <span>·</span>
            <span>Software & Mobile Engineer</span>
            <span>·</span>
            <span>Bangkok, Thailand</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 text-xs">
            <span>Cloudflare Pages Edge</span>
            <span>·</span>
            <span>Next.js 15</span>
            <span>·</span>
            <button
              onClick={() => {
                sound.playMechanicalClick();
                setIsCommandOpen(true);
              }}
              className="hover:text-white transition-colors cursor-pointer font-mono"
            >
              Press ⌘K
            </button>
          </div>
        </footer>
      </main>

      {/* Command Palette Matrix Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenQR={() => setIsQROpen(true)}
        onNotify={showNotification}
        onToggleSound={handleToggleSound}
        isSoundActive={isSoundActive}
      />

      {/* Optical QR Scanner Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onNotify={showNotification}
      />

      {/* Clean Telemetry Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
