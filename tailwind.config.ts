import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        void: "#070914",
        obsidian: "#0c1020",
        panel: "#11172b",
        panel2: "#151d34",
        cyan: "#67e8f9",
        teal: "#2dd4bf",
        amber: "#f6c85f",
        magenta: "#c084fc",
        danger: "#fb7185",
        gridline: "rgba(103, 232, 249, 0.11)"
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        retro: "0 0 0 1px rgba(103,232,249,.22), 0 18px 60px rgba(0,0,0,.45)",
        glow: "0 0 24px rgba(103,232,249,.28)",
        amber: "0 0 24px rgba(246,200,95,.22)"
      },
      keyframes: {
        gridRun: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: ".55" },
          "50%": { opacity: "1" }
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        }
      },
      animation: {
        gridRun: "gridRun 18s linear infinite",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
        scan: "scan 7s linear infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
