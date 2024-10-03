import { describe, test, expect } from "vitest";
import {
  convertToTailwindConfig,
  deepMerge,
  TailwindConfig,
  themeResolver,
  ThemeConfig,
} from "./themeResolver.ts";

describe("themeResolver", () => {
  test("convert theme config to tailwind config", () => {
    const result = convertToTailwindConfig(themeConfig);
    expect(result).toEqual(marketerTailwindConfig);
  });

  test("merge market and developer tailwind configs, prioritizing developer specifications", () => {
    const result = deepMerge(developerTailwindConfig, marketerTailwindConfig);
    expect(result).toEqual(mergedConfig);
  });

  test(
    "restructures theme config and merges with developer-specified tailwind config, " +
      "prioritizing developer sepecifications",
    () => {
      const result = themeResolver(developerTailwindConfig, themeConfig);
      expect(result).toEqual(mergedConfig);
    }
  );
});

const themeConfig: ThemeConfig = {
  colors: {
    label: "Colors",
    styles: {
      text: {
        label: "Text Color",
        plugin: "colors",
        type: "color",
        default: "black",
      },
      border: {
        label: "Border Color",
        plugin: "colors",
        type: "color",
        default: "hsl(var(--border))",
      },
      input: {
        label: "Input Color",
        plugin: "colors",
        type: "color",
        default: "hsl(var(--input))",
      },
      ring: {
        label: "Ring Color",
        plugin: "colors",
        type: "color",
        default: "hsl(var(--ring))",
      },
      background: {
        label: "Background Color",
        plugin: "colors",
        type: "color",
        default: "hsl(var(--background))",
      },
      foreground: {
        label: "Foreground Color",
        plugin: "colors",
        type: "color",
        default: "hsl(var(--foreground))",
      },
      primary: {
        label: "Primary Color",
        styles: {
          DEFAULT: {
            label: "Primary Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--primary))",
          },
          foreground: {
            label: "Primary Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--primary-foreground))",
          },
        },
      },
      secondary: {
        label: "Secondary Color",
        styles: {
          DEFAULT: {
            label: "Secondary Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--secondary))",
          },
          foreground: {
            label: "Secondary Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--secondary-foreground))",
          },
        },
      },
      destructive: {
        label: "Destructive Color",
        styles: {
          DEFAULT: {
            label: "Destructive Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--destructive))",
          },
          foreground: {
            label: "Destructive Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--destructive-foreground))",
          },
        },
      },
      muted: {
        label: "Muted Color",
        styles: {
          DEFAULT: {
            label: "Muted Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--muted))",
          },
          foreground: {
            label: "Muted Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--muted-foreground))",
          },
        },
      },
      accent: {
        label: "Accent Color",
        styles: {
          DEFAULT: {
            label: "Accent Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--accent))",
          },
          foreground: {
            label: "Accent Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--accent-foreground))",
          },
        },
      },
      popover: {
        label: "Popover Color",
        styles: {
          DEFAULT: {
            label: "Popover Color (Default)",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--popover))",
          },
          foreground: {
            label: "Popover Foreground Color",
            plugin: "colors",
            type: "color",
            default: "hsl(var(--popover-foreground))",
          },
        },
      },
    },
  },
  borderRadius: {
    label: "Border Radius",
    styles: {
      lg: {
        label: "Large Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: `var(--radius)`,
      },
      md: {
        label: "Medium Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: `calc(var(--radius) - 2px)`,
      },
      sm: {
        label: "Small Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: "calc(var(--radius) - 4px)",
      },
    },
  },
};

const marketerTailwindConfig: TailwindConfig = {
  colors: {
    text: "black",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
};

const developerTailwindConfig: TailwindConfig = {
  keyframes: {
    "accordion-down": {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" },
    },
  },
  animation: {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
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
};

const mergedConfig: TailwindConfig = {
  colors: {
    text: "black",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
  keyframes: {
    "accordion-down": {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" },
    },
  },
  animation: {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
  },
  container: {
    center: true,
    padding: { DEFAULT: "1rem", sm: "2rem", lg: "4rem", xl: "5rem" },
  },
};
