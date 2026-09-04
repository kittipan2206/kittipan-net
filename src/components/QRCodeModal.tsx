"use client";

import React, { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { profileConfig } from "@/config/profile";
import { sound } from "@/lib/sound";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export function QRCodeModal({ isOpen, onClose, onNotify }: QRCodeModalProps) {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.playMechanicalClick();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleClose = () => {
    sound.playMechanicalClick();
    onClose();
  };

  const handleCopy = async () => {
    sound.playSuccessChime();
    try {
      await navigator.clipboard.writeText(profileConfig.websiteUrl);
      setCopied(true);
      onNotify("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify("Clipboard unavailable");
    }
  };

  const handleDownload = () => {
    sound.playSuccessChime();
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${profileConfig.handle.replace("@", "")}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        onNotify("QR Code saved as PNG");
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark matte backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modern Modal Frame */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0f1116] border border-white/[0.1] p-6 shadow-2xl z-10 text-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-zinc-300 tracking-wide">
            QR Code
          </span>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.04] text-xs transition-colors cursor-pointer"
          >
            Esc ✕
          </button>
        </div>

        {/* QR Code Frame */}
        <div
          ref={qrRef}
          className="mx-auto w-52 h-52 p-4 bg-white rounded-xl flex items-center justify-center mb-4 shadow-xl"
        >
          <QRCodeSVG
            value={profileConfig.websiteUrl}
            size={176}
            level="H"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-orange-400 bg-white/[0.03] border border-white/[0.06] py-1.5 px-3 rounded-lg mb-5 inline-block font-mono">
          {profileConfig.websiteUrl}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="interactive-pill py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium transition-all cursor-pointer"
          >
            {copied ? "Copied ✓" : "Copy Link"}
          </button>

          <button
            onClick={handleDownload}
            className="interactive-pill py-2.5 px-3 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
          >
            Save PNG
          </button>
        </div>
      </div>
    </div>
  );
}
