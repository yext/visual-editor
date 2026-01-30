const { themeResolver } = require("../../utils/themeResolver.ts");
const { defaultThemeTailwindExtensions } = require("../../utils/themeConfigOptions.ts");
const { defaultThemeConfig } = require("../DefaultThemeConfig.ts");

// This Tailwind Config applies Theme Editor styles to our components
// during playwright testing
module.exports = {
  content: ["./src/components/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: themeResolver(defaultThemeTailwindExtensions, defaultThemeConfig),
  },
  plugins: [],
};
