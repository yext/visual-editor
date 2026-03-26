import type { Config } from "tailwindcss";
import {
  themeResolver,
  defaultThemeTailwindExtensions,
  defaultThemeConfig,
  VisualEditorComponentsContentPath,
  VisualEditorThemeClassSafelist,
} from "@yext/visual-editor";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    VisualEditorComponentsContentPath,
  ],
  safelist: VisualEditorThemeClassSafelist,
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
} satisfies Config;
