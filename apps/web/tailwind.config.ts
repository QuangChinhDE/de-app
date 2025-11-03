import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f9fafc",
          100: "#f2f4f8",
          200: "#e0e6ef",
          300: "#c5cee0",
          400: "#9aa9c6",
          500: "#6c7fa9",
          600: "#4b5f8c",
          700: "#384a6d",
          800: "#283454",
          900: "#1b243d"
        }
      }
    }
  },
  plugins: [],
};

export default config;
