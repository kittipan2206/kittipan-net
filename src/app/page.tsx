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
    }, 2800);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 machined-surface text-industrial-paper">
      {/* Central Machined Hardware Chassis Frame */}
      <div className="relative w-full max-w-xl my-auto rounded-lg bg-chassis-base border border-chassis-border p-5 sm:p-7 shadow-2xl">
        {/* Machine Screw Fixtures (Teenage Engineering Hardware Aesthetic) */}
        <div className="absolute top-3 left-3 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute top-3 right-3 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute bottom-3 left-3 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>
        <div className="absolute bottom-3 right-3 text-chassis-highlight font-mono text-[10px] select-none">
          ⨁
        </div>

        {/* Inner Panel Content */}
        <div className="pt-2 pb-1">
          {/* 1. Industrial Equipment Nameplate & Status */}
          <ProfileHeader />

          {/* 2. Tactile Hardware Push Buttons */}
          <ActionRow
            onOpenQR={() => setIsQROpen(true)}
            onNotify={showNotification}
          />

          {/* 3. Dedicated Rackmount Server Node Module */}
          <SmartHomeCard />

          {/* 4. Patchbay Port Interconnects */}
          <SocialLinks />

          {/* 5. System Topology / Hardware Silkscreen Specs */}
          <TechBadges />

          {/* 6. Machine Stamped Chassis Footer */}
          <footer className="w-full pt-4 mt-2 border-t border-chassis-border/80 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-industrial-zinc gap-2">
            <div>
              ENGINEERED // {profileConfig.name.toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-industrial-orange font-bold">CF-PAGES // EDGE</span>
              <span className="text-chassis-border">•</span>
              <span>{profileConfig.websiteUrl.replace("https://", "")}</span>
            </div>
          </footer>
        </div>
      </div>

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
