import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          '"Libre Caslon Text"',
          '"Adobe Caslon Pro"',
          "Caslon",
          '"EB Garamond"',
          "Georgia",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
        display: [
          "Elzevir-Italic",
          '"IM Fell English"',
          "Missaali",
          "Garamond",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      colors: {
        paper: "#eeece7",
        ink: "#1a1a1a",
        muted: "#7a7568",
        rule: "#c9c4b6",
      },
      typography: {
        DEFAULT: { css: { maxWidth: "68ch" } },
      },
    },
  },
  plugins: [],
};

export default config;
