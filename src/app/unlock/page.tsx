"use client";

import { useEffect } from "react";

// Cloudflare Access guards /unlock/. Reaching this page means sign-in succeeded; hand back to the OS.
export default function Unlock() {
  useEffect(() => {
    try {
      localStorage.setItem("kos_owner_hint", "1");
    } catch {}
    location.replace("/#launchpad");
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0c0a] font-mono text-[#d9d5cb]">
      <span className="lcd-digits text-5xl">UNLOCKING</span>
      <a href="/#launchpad" className="text-xs text-[#8c897f] underline">
        continue
      </a>
    </main>
  );
}
