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
        "action-blue": {
          DEFAULT: "#2563EB",
          50: "#EFF4FE",
          100: "#DBE7FD",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        "sky-accent": {
          DEFAULT: "#8ED8F8",
          100: "#EAF8FE",
          200: "#C9EDFC",
        },
        "deep-navy": "#0F1E3D",

        page: "#F7F9FC",
        ink: "#1A1D29",

        success: { bg: "#EAF3DE", text: "#27500A" },
        warning: { bg: "#FAEEDA", text: "#854F0B" },
        error: { bg: "#FCEBEB", text: "#791F1F" },
        info: { bg: "#E6F1FB", text: "#0C447C" },

        // Framework aliases (Radix/shadcn-style utilities used throughout: bg-background, text-muted-foreground, bg-card, etc.)
        border: "#E4E9F2",
        input: "#E4E9F2",
        ring: "#2563EB",
        background: "#F7F9FC",
        foreground: "#1A1D29",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F7F9FC",
          foreground: "#0F1E3D",
        },
        muted: {
          DEFAULT: "#F7F9FC",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#8ED8F8",
          foreground: "#0F1E3D",
        },
        destructive: {
          DEFAULT: "#791F1F",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F1E3D",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F1E3D",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
