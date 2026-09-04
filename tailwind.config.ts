import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chassis: {
          void: "#0c0d10",
          base: "#121418",
          module: "#171920",
          inset: "#0e0f13",
          hover: "#1d2029",
          border: "#252834",
          highlight: "#353949",
        },
        industrial: {
          orange: "#FF4F00", // Signature Teenage Engineering / Braun safety orange
          "orange-hover": "#FF671F",
          "orange-muted": "rgba(255, 79, 0, 0.12)",
          diode: "#22C55E", // Precision hardware LED green
          amber: "#F59E0B",
          zinc: "#8E93A2",
          paper: "#EDEDED",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        // Physical tactile button depth (unpressed)
        tactile: "0 2px 0 0 #252834, 0 4px 12px rgba(0, 0, 0, 0.5)",
        // Inset engraved panel shadow
        engraved: "inset 0 1px 3px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.04)",
        // Subtle diode glow (tight, not blurry blob)
        diode: "0 0 8px 1px rgba(34, 197, 94, 0.6)",
        "diode-orange": "0 0 8px 1px rgba(255, 79, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
