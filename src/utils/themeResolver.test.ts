import { describe, test, expect, vi } from "vitest";
import {
  convertToTailwindConfig,
  deepMerge,
  TailwindConfig,
  themeResolver,
  ThemeConfig,
} from "./themeResolver.ts";

describe("themeResolver", () => {
  test("convert theme config to tailwind config", () => {
    const result = convertToTailwindConfig(testThemeConfig);
    expect(result).toEqual(marketerTailwindConfig);
  });

  test("merge marketer and developer tailwind configs, prioritizing theme.config specifications", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    const result = deepMerge(developerTailwindConfig, marketerTailwindConfig);
    expect(result).toEqual(mergedConfig);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      "Both theme.config.ts and tailwind.config.ts provided a value for sm. Using the value from theme.config.ts (var(--borderRadius-sm))"
    );
  });

  test(
    "restructures theme config and merges with developer-specified tailwind config, " +
      "prioritizing theme.config",
    () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const result = themeResolver(developerTailwindConfig, testThemeConfig);
      expect(result).toEqual(mergedConfig);
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      expect(consoleSpy).toHaveBeenLastCalledWith(
        "Both theme.config.ts and tailwind.config.ts provided a value for sm. Using the value from theme.config.ts (var(--borderRadius-sm))"
      );
    }
  );
});

export const testThemeConfig: ThemeConfig = {
  colors: {
    label: "Colors",
    styles: {
      text: {
        label: "Text",
        plugin: "colors",
        type: "color",
        default: "black",
      },
      border: {
        label: "Border",
        plugin: "colors",
        type: "color",
        default: "hsl(214 100% 39%)",
      },
      input: {
        label: "Input",
        plugin: "colors",
        type: "color",
        default: "hsl(214.3 31.8% 91.4%)",
      },
      ring: {
        label: "Ring",
        plugin: "colors",
        type: "color",
        default: "hsl(215 20.2% 65.1%)",
      },
      background: {
        label: "Background",
        plugin: "colors",
        type: "color",
        default: "hsl(0 0% 100%)",
      },
      foreground: {
        label: "Foreground",
        plugin: "colors",
        type: "color",
        default: "hsl(0 2% 11%)",
      },
      primary: {
        label: "Primary",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 68% 51%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 0% 100%)",
          },
        },
      },
      secondary: {
        label: "Secondary",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(11 100% 26%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 0% 100%)",
          },
        },
      },
      destructive: {
        label: "Destructive",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 100% 50%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(210 40% 98%)",
          },
        },
      },
      muted: {
        label: "Muted",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(210 40% 96.1%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(215.4 16.3% 46.9%)",
          },
        },
      },
      accent: {
        label: "Accent",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(166 55% 67%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 0% 0%)",
          },
        },
      },
      popover: {
        label: "Secondary",
        styles: {
          DEFAULT: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(225 7% 12%)",
          },
          foreground: {
            label: "Default",
            plugin: "colors",
            type: "color",
            default: "hsl(0 0% 100%)",
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
        default: 8,
      },
      md: {
        label: "Medium Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: 6,
      },
      sm: {
        label: "Small Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: 4,
      },
    },
  },
};

const marketerTailwindConfig: TailwindConfig = {
  colors: {
    text: "var(--colors-text)",
    border: "var(--colors-border)",
    input: "var(--colors-input)",
    ring: "var(--colors-ring)",
    background: "var(--colors-background)",
    foreground: "var(--colors-foreground)",
    primary: {
      DEFAULT: "var(--colors-primary-DEFAULT)",
      foreground: "var(--colors-primary-foreground)",
    },
    secondary: {
      DEFAULT: "var(--colors-secondary-DEFAULT)",
      foreground: "var(--colors-secondary-foreground)",
    },
    destructive: {
      DEFAULT: "var(--colors-destructive-DEFAULT)",
      foreground: "var(--colors-destructive-foreground)",
    },
    muted: {
      DEFAULT: "var(--colors-muted-DEFAULT)",
      foreground: "var(--colors-muted-foreground)",
    },
    accent: {
      DEFAULT: "var(--colors-accent-DEFAULT)",
      foreground: "var(--colors-accent-foreground)",
    },
    popover: {
      DEFAULT: "var(--colors-popover-DEFAULT)",
      foreground: "var(--colors-popover-foreground)",
    },
  },
  borderRadius: {
    lg: "var(--borderRadius-lg)",
    md: "var(--borderRadius-md)",
    sm: "var(--borderRadius-sm)",
  },
};

const developerTailwindConfig: TailwindConfig = {
  borderRadius: {
    lg: "0px",
    md: "0px",
    sm: "0px",
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
    text: "var(--colors-text)",
    border: "var(--colors-border)",
    input: "var(--colors-input)",
    ring: "var(--colors-ring)",
    background: "var(--colors-background)",
    foreground: "var(--colors-foreground)",
    primary: {
      DEFAULT: "var(--colors-primary-DEFAULT)",
      foreground: "var(--colors-primary-foreground)",
    },
    secondary: {
      DEFAULT: "var(--colors-secondary-DEFAULT)",
      foreground: "var(--colors-secondary-foreground)",
    },
    destructive: {
      DEFAULT: "var(--colors-destructive-DEFAULT)",
      foreground: "var(--colors-destructive-foreground)",
    },
    muted: {
      DEFAULT: "var(--colors-muted-DEFAULT)",
      foreground: "var(--colors-muted-foreground)",
    },
    accent: {
      DEFAULT: "var(--colors-accent-DEFAULT)",
      foreground: "var(--colors-accent-foreground)",
    },
    popover: {
      DEFAULT: "var(--colors-popover-DEFAULT)",
      foreground: "var(--colors-popover-foreground)",
    },
  },
  borderRadius: {
    lg: "var(--borderRadius-lg)", // theme.config takes priority
    md: "var(--borderRadius-md)", // theme.config takes priority
    sm: "var(--borderRadius-sm)", // theme.config takes priority
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
