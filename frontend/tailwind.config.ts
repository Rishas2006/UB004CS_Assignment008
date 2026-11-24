import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1456C8",
          dark: "#0B2A6F",
          mid: "#2A6FDB",
          sky: "#DCEAFF",
          pale: "#EAF2FF",
          ice: "#F5F9FF",
        },
        alert: "#DC2626",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-sinhala)",
          "var(--font-tamil)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(11,42,111,.08)",
        lift: "0 18px 40px rgba(20,86,200,.18)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(.8)", opacity: ".7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        draw: { to: { strokeDashoffset: "0" } },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        dot: {
          "0%,80%,100%": { transform: "scale(.6)", opacity: ".4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s ease-out infinite",
        draw: "draw 2.2s ease-out forwards",
        floaty: "floaty 4s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        dot: "dot 1.2s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
