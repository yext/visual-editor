import type { Config } from "tailwindcss";
import { ComponentsContentPath } from "@yext/search-ui-react";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "!./src/components/puck/registry/**", // exclude the registry
    ComponentsContentPath,
  ],
  prefix: "ve-",
  theme: {
    extend: {
      colors: {
        text: "black",
        border: "hsl(240 28% 92%)",
        input: "hsl(214.3 31.8% 91.4)",
        ring: "hsl(215 20.2% 65.1%)",
        background: "hsl(0 0% 100)",
        foreground: "hsl(222.2 47.4% 11.2)",
        primary: {
          DEFAULT: "hsl(241 86% 65)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(257 51% 90)",
          foreground: "hsl(0 0% 0%)",
        },
        destructive: {
          DEFAULT: "hsl(0 100% 50%)",
          foreground: "hsl(0 0% 0%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        popover: {
          DEFAULT: "hsl(225 7% 12%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
