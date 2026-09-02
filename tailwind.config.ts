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
        bone: "#f7f4ee",
        champagne: "#d8b66f",
        graphite: "#0b0b0b",
      },
      fontFamily: {
        sans: ["Avenir Next", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Bodoni 72", "Didot", "Georgia", "serif"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(216, 182, 111, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
