"use client";

import React from "react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded bg-chassis-module border border-industrial-orange/80 text-industrial-paper text-xs font-mono shadow-2xl">
      <span className="w-1.5 h-1.5 rounded-full bg-industrial-diode shadow-diode" />
      <span className="tracking-wide font-semibold">{message}</span>
    </div>
  );
}
