import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light blueprint palette: cool paper grays, dark ink text.
        // "ink" is the page background, "bright" the primary text color.
        ink: "#F2F5F9",
        panel: "#FFFFFF",
        line: "#D3DCE6",
        dim: "#5F6B7C",
        bright: "#1C2127",
        accent: "#2D72D2",
        gold: "#B0721A",
        alert: "#CD4246",
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
