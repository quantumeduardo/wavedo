import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        bone: "#f6f1e8",
        champagne: "#d8b66f",
        graphite: "#171717",
      },
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Didot", "Bodoni 72", "Georgia", "serif"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(216, 182, 111, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
