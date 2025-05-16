import { type Config } from "tailwindcss";
import {
  themeResolver,
  defaultThemeTailwindExtensions,
} from "@yext/visual-editor";
import { defaultThemeConfig } from "../DefaultThemeConfig.ts";

// This Tailwind Config applies Theme Editor styles to our components
// during playwright testing
export default {
  content: ["./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
} satisfies Config;
