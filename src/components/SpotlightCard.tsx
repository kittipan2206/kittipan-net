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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -999, y: -999 });
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative rounded-md bg-chassis-module border border-chassis-border overflow-hidden transition-all duration-150 ${className}`}
    >
      {/* Specular Radial Highlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 79, 0, 0.18), transparent 75%)`,
        }}
      />

      {/* Inner Machined Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
