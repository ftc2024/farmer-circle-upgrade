import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        fc: {
          bg: "#070a12",
          panel: "#10162a",
          purple: "#755cf6",
          cyan: "#25d4ce",
          lime: "#c6ff00",
          text: "#eef3ff",
          muted: "#92a0c4"
        }
      }
    }
  },
  plugins: []
};

export default config;
