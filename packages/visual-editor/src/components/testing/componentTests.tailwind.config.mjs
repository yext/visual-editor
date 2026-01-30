import {
  defaultThemeConfig,
  defaultThemeTailwindExtensions,
  themeResolver,
} from "../../../dist/tailwind.js";

// This Tailwind Config applies Theme Editor styles to our components
// during playwright testing
export default {
  content: ["./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
};
