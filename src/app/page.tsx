"use client";

import React, { useState } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ActionRow } from "@/components/ActionRow";
import { SmartHomeCard } from "@/components/SmartHomeCard";
import { SocialLinks } from "@/components/SocialLinks";
import { TechBadges } from "@/components/TechBadges";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Toast } from "@/components/Toast";
import { profileConfig } from "@/config/profile";

export default function Home() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden cyber-grid">
      {/* Dynamic ambient gradient orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Quick Action Buttons (Save Contact, QR, Email) */}
        <ActionRow
          onOpenQR={() => setIsQROpen(true)}
          onNotify={showNotification}
        />

        {/* Smart Home Portal Showcase */}
        <div className="w-full mb-5">
          <SmartHomeCard />
        </div>

        {/* Social / Direct Links */}
        <SocialLinks />

        {/* Homelab & Tech Badges */}
        <TechBadges />

        {/* Footer */}
        <footer className="w-full text-center py-4 border-t border-white/5 text-[11px] font-mono text-gray-500">
          <p className="mb-1">
            © {new Date().getFullYear()} {profileConfig.name} • {profileConfig.handle}
          </p>
          <p className="text-gray-600">
            Powered by Next.js & Cloudflare Pages
          </p>
        </footer>
      </div>

      {/* Interactive QR Code Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onNotify={showNotification}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </main>
  );
}
