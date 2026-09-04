"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

export interface CommandItem {
  id: string;
  category: "NODES" | "ACTIONS" | "CHANNELS" | "SYSTEM";
  title: string;
  subtitle: string;
  hotkey: string;
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQR: () => void;
  onNotify: (msg: string) => void;
  onToggleSound: () => void;
  isSoundActive: boolean;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenQR,
  onNotify,
  onToggleSound,
  isSoundActive,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    {
      id: "smarthome",
      category: "NODES",
      title: "Launch Smart Home Portal",
      subtitle: "https://home.kittipan.net (Hyper-V / Cloudflare Tunnel)",
      hotkey: "H",
      action: () => {
        sound.playMechanicalClick();
        window.open(profileConfig.smartHomeNode.url, "_blank");
        onClose();
      },
    },
    {
      id: "save-vcard",
      category: "ACTIONS",
      title: "Save Contact Card (.vcf)",
      subtitle: "Export digital business card directly to device",
      hotkey: "V",
      action: () => {
        sound.playSuccessChime();
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
        onClose();
      },
    },
    {
      id: "copy-email",
      category: "ACTIONS",
      title: "Copy Direct Email",
      subtitle: profileConfig.email,
      hotkey: "C",
      action: async () => {
        sound.playSuccessChime();
        try {
          await navigator.clipboard.writeText(profileConfig.email);
          onNotify(`COPIED // ${profileConfig.email}`);
        } catch {
          onNotify("ERROR // CLIPBOARD UNAVAILABLE");
        }
        onClose();
      },
    },
    {
      id: "scan-qr",
      category: "ACTIONS",
      title: "Inspect Optical QR Code",
      subtitle: "Generate optical link preview & download high-res PNG",
      hotkey: "Q",
      action: () => {
        sound.playMechanicalClick();
        onClose();
        onOpenQR();
      },
    },
    {
      id: "github",
      category: "CHANNELS",
      title: "Open GitHub Profile",
      subtitle: "https://github.com/kittipan2206",
      hotkey: "G",
      action: () => {
        sound.playMechanicalClick();
        window.open("https://github.com/kittipan2206", "_blank");
        onClose();
      },
    },
    {
      id: "telegram",
      category: "CHANNELS",
      title: "Launch Telegram Automation Bot",
      subtitle: "@kittipan_ha_bot (Home Assistant AI Bot)",
      hotkey: "T",
      action: () => {
        sound.playMechanicalClick();
        window.open("https://t.me/kittipan_ha_bot", "_blank");
        onClose();
      },
    },
    {
      id: "toggle-sound",
      category: "SYSTEM",
      title: isSoundActive ? "Mute Mechanical Sound FX" : "Enable Mechanical Sound FX",
      subtitle: isSoundActive ? "Sound is currently ON" : "Sound is currently OFF",
      hotkey: "M",
      action: () => {
        onToggleSound();
        onClose();
      },
    },
  ], [isSoundActive, onClose, onNotify, onOpenQR, onToggleSound]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.hotkey.toLowerCase() === q ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      sound.playMechanicalClick();
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sound.playMechanicalClick();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        sound.playMechanicalClick();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        sound.playMechanicalClick();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        return;
      }

      // Check single-key hotkey matches if not typing text inside input
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && !query) {
        const keyUpper = e.key.toUpperCase();
        const matched = commands.find((c) => c.hotkey === keyUpper);
        if (matched) {
          e.preventDefault();
          matched.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, query, commands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 font-mono">
      {/* Backdrop blur */}
      <div
        onClick={() => {
          sound.playMechanicalClick();
          onClose();
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Palette Terminal Modal */}
      <div className="relative w-full max-w-lg rounded-lg bg-chassis-base border-2 border-chassis-border shadow-2xl overflow-hidden z-10 text-industrial-paper">
        {/* Machine Headstrip */}
        <div className="flex items-center justify-between px-4 py-2 bg-chassis-module border-b border-chassis-border text-[10px] text-industrial-zinc">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-industrial-orange inline-block" />
            <span className="font-bold text-industrial-paper tracking-wider uppercase">
              COMMAND MATRIX // RAYCAST DISPATCH
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-chassis-inset border border-chassis-border text-industrial-zinc">
              ESC TO CLOSE
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b border-chassis-border bg-chassis-inset">
          <span className="text-industrial-orange font-bold text-sm mr-2.5">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or hotkey (H, G, T, C, Q, V, M)..."
            className="w-full bg-transparent text-sm text-industrial-paper placeholder:text-industrial-zinc/60 outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-industrial-zinc hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Command Items List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-industrial-zinc">
              NO DIRECTIVES FOUND MATCHING &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-all ${
                    isSelected
                      ? "bg-industrial-orange/15 border border-industrial-orange/60 text-white"
                      : "hover:bg-chassis-module text-industrial-paper border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                        isSelected
                          ? "bg-industrial-orange text-black"
                          : "bg-chassis-inset text-industrial-zinc border border-chassis-border"
                      }`}
                    >
                      {cmd.category}
                    </span>
                    <div>
                      <div className="text-xs font-bold font-sans tracking-wide">
                        {cmd.title}
                      </div>
                      <div className="text-[10px] text-industrial-zinc">
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Hotkey Badge */}
                  <div className="flex items-center gap-1">
                    <kbd
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-sm ${
                        isSelected
                          ? "bg-industrial-orange text-black"
                          : "bg-chassis-inset border border-chassis-border text-industrial-zinc"
                      }`}
                    >
                      {cmd.hotkey}
                    </kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-chassis-border/80 bg-chassis-module text-[10px] text-industrial-zinc">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-industrial-paper">↑↓</strong> NAVIGATE
            </span>
            <span>
              <strong className="text-industrial-paper">↵</strong> EXECUTE
            </span>
          </div>
          <span className="text-industrial-orange font-semibold">
            {filteredCommands.length} DIRECTIVES READY
          </span>
        </div>
      </div>
    </div>
  );
}
