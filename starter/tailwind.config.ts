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
        },
      },
      themeConfig,
    ),
  },
  plugins: [],
} satisfies Config;
