"use client";

import React, { useRef, useState } from "react";
import { sound } from "@/lib/sound";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  playClickSound?: boolean;
}

export function SpotlightCard({
  children,
  className = "",
  onClick,
  playClickSound = false,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -999, y: -999 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = () => {
    if (playClickSound) {
      sound.playMechanicalClick();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -999, y: -999 });
      }}
      onClick={handleClick}
      className={`relative rounded-2xl bg-[#0e1015]/80 backdrop-blur-md border border-white/[0.07] hover:border-white/[0.14] overflow-hidden transition-all duration-200 shadow-lg ${className}`}
    >
      {/* Specular Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 85, 0, 0.09), transparent 80%)`,
        }}
      />

      {/* Inner Content Container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
