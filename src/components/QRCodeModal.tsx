"use client";

import React, { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { profileConfig } from "@/config/profile";

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
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileConfig.websiteUrl);
      setCopied(true);
      onNotify("COPIED // URL CLIPBOARD");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify("ERROR // CLIPBOARD UNAVAILABLE");
    }
  };

  const handleDownload = () => {
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
        onNotify("SAVED // QR PNG IMAGE");
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark matte backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Optical Inspection Window */}
      <div className="relative w-full max-w-sm rounded bg-chassis-base border-2 border-chassis-border p-6 shadow-2xl z-10 text-center font-mono">
        {/* Corner alignment marks */}
        <span className="absolute top-2 left-2 text-[10px] text-industrial-zinc select-none">+</span>
        <span className="absolute top-2 right-2 text-[10px] text-industrial-zinc select-none">+</span>
        <span className="absolute bottom-2 left-2 text-[10px] text-industrial-zinc select-none">+</span>
        <span className="absolute bottom-2 right-2 text-[10px] text-industrial-zinc select-none">+</span>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-chassis-border pb-2.5 mb-4 text-xs">
          <span className="text-industrial-orange font-bold uppercase tracking-wider">
            OPTICAL SCANNER // UNIT: KS-01
          </span>
          <button
            onClick={onClose}
            className="text-industrial-zinc hover:text-white px-2 py-0.5 rounded bg-chassis-module border border-chassis-border"
          >
            ESC ✕
          </button>
        </div>

        {/* QR Code Frame */}
        <div
          ref={qrRef}
          className="mx-auto w-52 h-52 p-4 bg-white rounded flex items-center justify-center mb-4 border border-chassis-border shadow-inner"
        >
          <QRCodeSVG
            value={profileConfig.websiteUrl}
            size={176}
            level="H"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-industrial-orange bg-chassis-inset border border-chassis-border py-1.5 px-3 rounded mb-4 inline-block font-mono">
          {profileConfig.websiteUrl}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="btn-tactile py-2.5 px-3 rounded bg-chassis-module border border-chassis-border text-industrial-paper font-semibold hover:border-chassis-highlight"
          >
            {copied ? "COPIED ✓" : "COPY LINK"}
          </button>

          <button
            onClick={handleDownload}
            className="btn-tactile py-2.5 px-3 rounded bg-chassis-module border border-industrial-orange/60 text-industrial-orange font-semibold hover:bg-chassis-hover"
          >
            SAVE PNG
          </button>
        </div>
      </div>
    </div>
  );
}
