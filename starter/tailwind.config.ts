import type { Config } from "tailwindcss";
import {
  themeResolver,
  defaultThemeTailwindExtensions,
  defaultThemeConfig,
} from "@yext/visual-editor";
import { ComponentsContentPath } from "@yext/search-ui-react";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./node_modules/@yext/visual-editor/dist/**/*.js",
    ComponentsContentPath,
  ],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
} satisfies Config;
