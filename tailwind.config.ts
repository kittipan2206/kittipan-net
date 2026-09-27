import type { Config } from "tailwindcss";

// Colors resolve to CSS variables in globals.css so every phase (dawn/day/dusk/night) re-themes for free.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        led: "var(--led)",
        panel: "var(--panel)",
        card: "var(--card)",
        frame: "var(--frame)",
        ink: "var(--ink)",
        sub: "var(--sub)",
        line: "var(--line)",
        key: "var(--key)",
        chip: "var(--chip)",
        bar: "var(--bar)",
        label: "var(--label)",
        lcd: {
          DEFAULT: "var(--lcd)",
          ink: "var(--lcd-ink)",
          text: "var(--lcd-text)",
          sub: "var(--lcd-sub)",
          line: "var(--lcd-line)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        dot: ["var(--font-dot)", "var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      boxShadow: {
        window: "var(--win-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
