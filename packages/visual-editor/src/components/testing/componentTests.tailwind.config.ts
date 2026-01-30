import { themeResolver } from "../../utils/themeResolver.ts";
import { defaultThemeTailwindExtensions } from "../../utils/themeConfigOptions.ts";
import { defaultThemeConfig } from "../DefaultThemeConfig.ts";

// This Tailwind Config applies Theme Editor styles to our components
// during playwright testing
const config = {
  content: ["./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
};

export default config;
