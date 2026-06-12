import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "1.5rem",
        xl: "1.5rem",
        "2xl": "1.5rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        // Brand
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBE7FE",
          600: "#2563EB",
          700: "#1D4ED8",
          foreground: "#FFFFFF",
        },
        // Accent (WDD logo)
        accent: {
          red: "#EF4444",
          orange: "#F59E0B",
          yellow: "#FACC15",
          green: "#22C55E",
          teal: "#14B8A6",
          pink: "#EC4899",
          purple: "#8B5CF6",
        },
        // Status
        success: { DEFAULT: "#22C55E", bg: "#DCFCE7" },
        warning: { DEFAULT: "#D97706", bg: "#FEF3C7" },
        danger: { DEFAULT: "#DC2626", bg: "#FEE2E2" },
        info: { DEFAULT: "#2563EB", bg: "#DBEAFE" },
        // Surface & Text
        surface: {
          DEFAULT: "#FFFFFF",
          section: "#F8FAFC",
          elevated: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#D3DBE6",
        },
        whatsapp: { DEFAULT: "#25D366", dark: "#128C7E" },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15,23,42,.06)",
        md: "0 4px 12px rgba(15,23,42,.06)",
        lg: "0 8px 24px rgba(15,23,42,.08)",
        xl: "0 16px 48px rgba(15,23,42,.10)",
        card: "0 8px 24px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 16px 40px rgba(15, 23, 42, 0.12)",
        focus: "0 0 0 4px rgba(37,99,235,.22)",
      },
      spacing: {
        "header": "var(--header-h)",
      },
      maxWidth: {
        container: "1200px",
        content: "880px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(.2,.7,.2,1)",
        spring: "cubic-bezier(.34,1.56,.64,1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "320ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s cubic-bezier(.2,.7,.2,1) forwards",
        "fade-up": "fade-up 0.6s cubic-bezier(.2,.7,.2,1) forwards",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(.2,.7,.2,1) forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
