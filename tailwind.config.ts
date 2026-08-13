import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Khan Academy–inspired palette
        khan: {
          navy: "#0A2A66",
          "navy-light": "#1A3D80",
          "navy-dark": "#071D4A",
        },
        teal: {
          DEFAULT: "#14BF96",
          50: "#E8FBF6",
          100: "#C3F5E6",
          500: "#14BF96",
          600: "#0FA37E",
          700: "#0A8567",
        },
        ice: {
          DEFAULT: "#F0F4F9",
          50: "#F8FAFC",
          100: "#F0F4F9",
          200: "#E2E8F0",
        },
        sun: {
          DEFAULT: "#FFC212",
          50: "#FFF8E1",
          100: "#FFECB3",
          500: "#FFC212",
          600: "#FFB300",
        },
        slate: {
          border: "#E2E8F0",
        },
        // Semantic aliases
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#14BF96",
        background: "#F0F4F9",
        foreground: "#0A2A66",
        primary: {
          DEFAULT: "#0A2A66",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F0F4F9",
          foreground: "#0A2A66",
        },
        muted: {
          DEFAULT: "#F0F4F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#14BF96",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0A2A66",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0A2A66",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(10, 42, 102, 0.06), 0 1px 2px -1px rgba(10, 42, 102, 0.04)",
        "card-hover":
          "0 4px 12px 0 rgba(10, 42, 102, 0.1), 0 2px 4px -2px rgba(10, 42, 102, 0.06)",
        nav: "0 -1px 0 0 #E2E8F0",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "pulse-teal": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(20, 191, 150, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(20, 191, 150, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        "pulse-teal": "pulse-teal 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
