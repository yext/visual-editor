// This Tailwind Config applies Theme Editor styles to our components
import { themeResolver } from "../../utils/themeResolver.ts";
import { defaultThemeConfig } from "../DefaultThemeConfig.ts";
import { defaultThemeTailwindExtensions } from "../../utils/themeConfigOptions.ts";

// during playwright testing
export default {
  content: ["./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
};
