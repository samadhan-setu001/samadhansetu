import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F172A", // modern slate-900 high contrast text
          soft: "#475569",    // slate-600 secondary text
          muted: "#94A3B8"    // slate-400 subtle text
        },
        paper: {
          DEFAULT: "#F8FAFC", // modern clean slate-50 backdrop
          raised: "#FFFFFF",  // pure crisp white for cards
          line: "#E2E8F0",    // slate-200 border
          subtle: "#F1F5F9"   // slate-100 secondary pill background
        },
        civic: {
          DEFAULT: "#2563EB", // electric civic blue primary
          hover: "#1D4ED8",
          soft: "#EFF6FF",
          glow: "rgba(37, 99, 235, 0.15)"
        },
        signal: {
          DEFAULT: "#F59E0B", // amber-500 pending/in-progress
          soft: "#FFFBEB"
        },
        verified: {
          DEFAULT: "#10B981", // emerald-500 verified green
          soft: "#ECFDF5"
        },
        brick: {
          DEFAULT: "#EF4444", // rose-500 disputed / urgent
          soft: "#FEF2F2"
        },
        steel: {
          DEFAULT: "#1E40AF", // authority deep indigo
          soft: "#EEF2FF"
        },
        officer: {
          DEFAULT: "#7C3AED", // officer royal purple
          soft: "#F5F3FF"
        }
      },
      fontFamily: {
        display: ["var(--font-plex)", "system-ui", "sans-serif"],
        sans: ["var(--font-plex)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem"
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
        "card-hover": "0 10px 20px -5px rgba(15, 23, 42, 0.08), 0 6px 6px -6px rgba(15, 23, 42, 0.04)",
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
