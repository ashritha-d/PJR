import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f2",
          100: "#e0ebe0",
          200: "#c1d7c2",
          300: "#98bc9a",
          400: "#6c9c70",
          500: "#4c7a3d",
          600: "#39602f",
          700: "#2d4d26",
          800: "#1f3319",
          900: "#152412",
        },
        earth: {
          50: "#f8f3ee",
          100: "#efe1d3",
          200: "#ddc1a3",
          300: "#c69a6d",
          400: "#a97748",
          500: "#8a5a34",
          600: "#6b4423",
          700: "#54341b",
          800: "#3d2513",
          900: "#28180c",
        },
        cream: {
          DEFAULT: "#FBF7EE",
          100: "#FFFFFF",
          200: "#FBF7EE",
          300: "#F3ECDC",
        },
        gold: {
          DEFAULT: "#D4A017",
          light: "#E6C158",
          dark: "#A87D0F",
        },
      },
      fontFamily: {
        display: ["Georgia", "'Playfair Display'", "serif"],
        body: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(31, 51, 25, 0.12)",
        card: "0 2px 12px -2px rgba(31, 51, 25, 0.10)",
      },
      backgroundImage: {
        "leaf-pattern": "url('/brand/leaf-pattern.svg')",
      },
    },
  },
  plugins: [],
};

export default config;
