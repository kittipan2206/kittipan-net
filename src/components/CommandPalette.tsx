"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

export interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Channels" | "Preferences";
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
      category: "Navigation",
      title: "Smart Home Portal",
      subtitle: "Open home.kittipan.net (Hyper-V / Cloudflare Tunnel)",
      hotkey: "H",
      action: () => {
        sound.playMechanicalClick();
        window.open(profileConfig.smartHomeNode.url, "_blank");
        onClose();
      },
    },
    {
      id: "save-vcard",
      category: "Actions",
      title: "Save Contact (.vcf)",
      subtitle: "Download digital contact card to your phone or computer",
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
        onNotify("Contact saved (.vcf)");
        onClose();
      },
    },
    {
      id: "copy-email",
      category: "Actions",
      title: "Copy Email Address",
      subtitle: profileConfig.email,
      hotkey: "C",
      action: async () => {
        sound.playSuccessChime();
        try {
          await navigator.clipboard.writeText(profileConfig.email);
          onNotify(`Copied ${profileConfig.email}`);
        } catch {
          onNotify("Clipboard unavailable");
        }
        onClose();
      },
    },
    {
      id: "scan-qr",
      category: "Actions",
      title: "Show QR Code",
      subtitle: "Scan to open on mobile or export high-res PNG",
      hotkey: "Q",
      action: () => {
        sound.playMechanicalClick();
        onClose();
        onOpenQR();
      },
    },
    {
      id: "github",
      category: "Channels",
      title: "GitHub Repositories",
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
      category: "Channels",
      title: "Telegram Assistant Bot",
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
      category: "Preferences",
      title: isSoundActive ? "Mute Sound Feedback" : "Enable Sound Feedback",
      subtitle: isSoundActive ? "Audio feedback is currently active" : "Audio feedback is currently muted",
      hotkey: "M",
      action: () => {
        onToggleSound();
        onClose();
      },
    },
  ], [isSoundActive, onClose, onNotify, onOpenQR, onToggleSound]);

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

  useEffect(() => {
    if (isOpen) {
      sound.playMechanicalClick();
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4">
      {/* Backdrop */}
      <div
        onClick={() => {
          sound.playMechanicalClick();
          onClose();
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f1116] border border-white/[0.1] shadow-2xl overflow-hidden z-10 text-white">
        {/* Search Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <span className="text-zinc-500 mr-3 text-sm">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-zinc-500 hover:text-white px-1.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Command Items List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No directives found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.08] text-white"
                      : "hover:bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.05]">
                      {cmd.category}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {cmd.title}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  <kbd className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                    {cmd.hotkey}
                  </kbd>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-black/30 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span><strong className="text-zinc-300">↑↓</strong> to navigate</span>
            <span><strong className="text-zinc-300">↵</strong> to select</span>
            <span><strong className="text-zinc-300">esc</strong> to close</span>
          </div>
          <span className="font-mono text-[11px]">{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}
