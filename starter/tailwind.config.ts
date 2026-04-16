import type { Config } from "tailwindcss";
import { ComponentsContentPath as SearchUiComponentsContentPath } from "@yext/search-ui-react";
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
    SearchUiComponentsContentPath,
  ],
  safelist: VisualEditorThemeClassSafelist,
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
} satisfies Config;
