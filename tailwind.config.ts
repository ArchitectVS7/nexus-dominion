import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lcars: {
          amber: "#FF9900",
          lavender: "#CC99FF",
          salmon: "#FF9999",
          peach: "#FFCC99",
          blue: "#99CCFF",
          mint: "#99FFCC",
          orange: "#FF7700",
          purple: "#9977FF",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-exo2)", "sans-serif"],
      },
      borderRadius: {
        lcars: "12px",
        "lcars-pill": "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
