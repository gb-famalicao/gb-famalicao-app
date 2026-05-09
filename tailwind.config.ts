import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
  colors: {
        // Mapeamento para as variáveis do globals.css
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // Suas cores customizadas Gracie Barra
        gb: {
          blue: "#CC0000",
          "blue-dark": "#990000",
          "blue-light": "#E31E24",
          black: "#0A0A0A",
          white: "#FFFFFF",
          gray: "#F5F5F5",
          "gray-dark": "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sf-pro)", "system-ui", "sans-serif"],
        display: ["var(--font-sf-pro)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;