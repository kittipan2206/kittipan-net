"use client";

import React, { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ActionRow } from "@/components/ActionRow";
import { SmartHomeCard } from "@/components/SmartHomeCard";
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
    showNotification(newState ? "AUDIO FX // ENABLED" : "AUDIO FX // MUTED");
  };

  // Global Keyboard Shortcuts (Cmd+K, H, G, T, C, Q, V, M)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      // Single-key hotkeys when modals are closed
      if (!isCommandOpen && !isQROpen && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "m") {
          e.preventDefault();
          handleToggleSound();
        } else if (key === "q") {
          e.preventDefault();
          sound.playMechanicalClick();
          setIsQROpen(true);
        } else if (key === "h") {
          e.preventDefault();
          sound.playMechanicalClick();
          window.open(profileConfig.smartHomeNode.url, "_blank");
        } else if (key === "g") {
          e.preventDefault();
          sound.playMechanicalClick();
          window.open("https://github.com/kittipan2206", "_blank");
        } else if (key === "t") {
          e.preventDefault();
          sound.playMechanicalClick();
          window.open("https://t.me/kittipan_ha_bot", "_blank");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isCommandOpen, isQROpen]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2.5 sm:p-5 md:p-8 machined-surface text-industrial-paper">
      {/* Central Machined Hardware Chassis Frame */}
      <div className="relative w-full max-w-4xl my-auto rounded-lg bg-chassis-base border border-chassis-border p-4 sm:p-6 md:p-7 shadow-2xl">
        {/* Machine Screw Fixtures (Teenage Engineering Hardware Aesthetic) */}
        <div className="absolute top-2.5 left-2.5 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute top-2.5 right-2.5 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute bottom-2.5 left-2.5 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute bottom-2.5 right-2.5 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>

        {/* Hardware Chassis Top Control Bar */}
        <div className="w-full flex items-center justify-between border-b border-chassis-border/80 pb-3 mb-4 text-[10px] font-mono text-industrial-zinc px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-industrial-orange inline-block" />
            <span className="font-bold text-industrial-paper tracking-wider uppercase">
              KITTIPAN // CONTROL MATRIX
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                sound.playMechanicalClick();
                setIsCommandOpen(true);
              }}
              className="btn-tactile flex items-center gap-1.5 px-2.5 py-1 rounded bg-chassis-module border border-chassis-border text-industrial-paper hover:border-industrial-orange transition-colors cursor-pointer"
            >
              <span className="text-industrial-orange font-bold">⌘K</span>
              <span className="hidden sm:inline">DISPATCH</span>
            </button>

            {/* Audio FX Rocker Switch */}
            <button
              onClick={handleToggleSound}
              title={isSoundActive ? "Mute Mechanical Audio FX" : "Enable Mechanical Audio FX"}
              className={`btn-tactile flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                isSoundActive
                  ? "bg-chassis-module border-industrial-orange/60 text-industrial-orange"
                  : "bg-chassis-module border-chassis-border text-industrial-zinc"
              }`}
            >
              <span>{isSoundActive ? "🔊 FX ON" : "🔇 MUTED"}</span>
            </button>
          </div>
        </div>

        {/* BENTO GRID MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bento Cell 1: Hero Identity Card (2 cols) */}
          <SpotlightCard className="md:col-span-2">
            <ProfileHeader />
          </SpotlightCard>

          {/* Bento Cell 2: Live Telemetry & Bangkok Clock (1 col) */}
          <SpotlightCard className="md:col-span-1">
            <LiveTelemetry />
          </SpotlightCard>

          {/* Bento Cell 3: Smart Home Portal Node (2 cols) */}
          <SpotlightCard className="md:col-span-2">
            <SmartHomeCard />
          </SpotlightCard>

          {/* Bento Cell 4: Tactile Action Matrix (1 col) */}
          <SpotlightCard className="md:col-span-1 p-3.5 flex flex-col justify-center">
            <div className="w-full text-[10px] font-mono text-industrial-zinc border-b border-chassis-border/80 pb-2 mb-2.5 flex items-center justify-between">
              <span className="font-bold tracking-wider uppercase text-industrial-paper">
                QUICK DIRECTIVES
              </span>
              <span>KEY [1-3]</span>
            </div>
            <ActionRow
              onOpenQR={() => setIsQROpen(true)}
              onNotify={showNotification}
            />
          </SpotlightCard>

          {/* Bento Cell 5: Patchbay Communication Ports (2 cols) */}
          <SpotlightCard className="md:col-span-2">
            <SocialLinks />
          </SpotlightCard>

          {/* Bento Cell 6: System Spec Silkscreen Topology (1 col) */}
          <SpotlightCard className="md:col-span-1">
            <TechBadges />
          </SpotlightCard>
        </div>

        {/* Machine Stamped Chassis Footer */}
        <footer className="w-full pt-4 mt-3 border-t border-chassis-border/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-industrial-zinc gap-2 px-1">
          <div>
            ENGINEERED // {profileConfig.name.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-industrial-orange font-bold">CF-PAGES // EDGE</span>
            <span className="text-chassis-border">•</span>
            <span>PRESS <strong className="text-industrial-paper">⌘K</strong> FOR COMMAND MATRIX</span>
          </div>
        </footer>
      </div>

      {/* Raycast-Style Command Matrix Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenQR={() => setIsQROpen(true)}
        onNotify={showNotification}
        onToggleSound={handleToggleSound}
        isSoundActive={isSoundActive}
      />

      {/* Optical QR Inspection Scanner Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onNotify={showNotification}
      />

      {/* Industrial Telemetry Toast */}
      <Toast message={toastMessage} />
    </main>
  );
}
