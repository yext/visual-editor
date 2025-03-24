import type { Config } from "tailwindcss";
import { themeConfig } from "./theme.config";
import { themeResolver } from "@yext/visual-editor";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./node_modules/@yext/visual-editor/dist/**/*.js",
  ],
  theme: {
    extend: themeResolver(
      {
        colors: {
          "palette-primary-light":
            "hsl(from var(--colors-palette-primary) h s 98)",
          "palette-secondary-light":
            "hsl(from var(--colors-palette-secondary) h s 98)",
          "palette-tertiary-light":
            "hsl(from var(--colors-palette-tertiary) h s 98)",
          "palette-quaternary-light":
            "hsl(from var(--colors-palette-quaternary) h s 98)",
          "palette-primary-dark":
            "hsl(from var(--colors-palette-primary) h s 20)",
          "palette-secondary-dark":
            "hsl(from var(--colors-palette-secondary) h s 20)",
          gray: {
            100: "#F9F9F9",
            200: "EDEDED",
            300: "#D4D4D4",
            400: "#BABABA",
            500: "#7A7A7A",
            600: "#2B2B2B",
            800: "#1F1F1F",
            900: "#121212",
          },
        },
      },
      themeConfig,
    ),
  },
  plugins: [],
} satisfies Config;
