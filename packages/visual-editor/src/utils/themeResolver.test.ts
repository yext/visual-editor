import { describe, test, expect, vi } from "vitest";
import {
  convertToTailwindConfig,
  deepMerge,
  TailwindConfig,
  themeResolver,
  ThemeConfig,
} from "./themeResolver.ts";
import { getSpacingOptions } from "./themeConfigOptions.ts";

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
      "Both theme.config.ts and tailwind.config.ts provided a value for button-primary. Using the value from theme.config.ts (var(--colors-button-primary))"
    );
  });

  test(
    "restructures theme config and merges with developer-specified tailwind config, " +
      "prioritizing theme.config",
    () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const result = themeResolver(developerTailwindConfig, testThemeConfig);
      expect(result).toEqual(mergedConfig);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenLastCalledWith(
        "Both theme.config.ts and tailwind.config.ts provided a value for button-primary. Using the value from theme.config.ts (var(--colors-button-primary))"
      );
    }
  );
});

const getColorOptions = () => {
  return [
    { label: "Primary", value: "var(--colors-palette-primary)" },
    { label: "Secondary", value: "var(--colors-palette-secondary)" },
    { label: "Accent", value: "var(--colors-palette-accent)" },
    { label: "Text", value: "var(--colors-palette-text)" },
    { label: "Background", value: "var(--colors-palette-background)" },
    { label: "Foreground", value: "var(--colors-palette-foreground)" },
  ];
};

const getWeightOptions = () => {
  return [
    { label: "Thin (100)", value: "100" },
    { label: "Extralight (200)", value: "200" },
    { label: "Light (300)", value: "300" },
    { label: "Normal (400)", value: "400" },
    { label: "Medium (500)", value: "500" },
    { label: "Semibold (600)", value: "600" },
    { label: "Bold (700)", value: "700" },
    { label: "Extrabold (800)", value: "800" },
    { label: "Black (900)", value: "900" },
  ];
};

export const testThemeConfig: ThemeConfig = {
  palette: {
    label: "Color Palette",
    styles: {
      primary: {
        label: "Primary",
        type: "color",
        default: "#D83B18",
        plugin: "colors",
      },
      secondary: {
        label: "Secondary",
        type: "color",
        default: "#871900",
        plugin: "colors",
      },
      accent: {
        label: "Accent",
        type: "color",
        default: "#FFFFFF",
        plugin: "colors",
      },
      text: {
        label: "Text",
        type: "color",
        default: "#000000",
        plugin: "colors",
      },
      background: {
        label: "Background",
        plugin: "colors",
        styles: {
          light: {
            label: "Light",
            type: "color",
            default: "#FFFFFF",
          },
          DEFAULT: {
            label: "Default",
            type: "color",
            default: "#F7F7F7",
          },
          dark: {
            label: "Dark",
            type: "color",
            default: "#F0F0F0",
          },
        },
      },
      foreground: {
        label: "Foreground",
        type: "color",
        plugin: "colors",
        default: "#000000",
      },
    },
  },
  heading1: {
    label: "Heading 1",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
    },
  },
  heading2: {
    label: "Heading 2",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
    },
  },
  heading3: {
    label: "Heading 3",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
    },
  },
  heading4: {
    label: "Heading 4",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-secondary)",
      },
    },
  },
  heading5: {
    label: "Heading 5",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-secondary)",
      },
    },
  },
  heading6: {
    label: "Heading 6",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-secondary)",
      },
    },
  },
  body: {
    label: "Body Text",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 12,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "400",
      },
      color: {
        label: "Text Color",
        plugin: "colors",
        styles: {
          light: {
            label: "Light Mode",
            type: "select",
            options: getColorOptions(),
            default: "var(--colors-palette-text)",
          },
          dark: {
            label: "Dark Mode",
            type: "select",
            options: getColorOptions(),
            default: "var(--colors-palette-text)",
          },
        },
      },
    },
  },
  pageSection: {
    label: "Page Section",
    styles: {
      gap: {
        label: "gap",
        type: "number",
        plugin: "gap",
        default: 8,
      },
      verticalPadding: {
        label: "Vertical Padding",
        type: "select",
        plugin: "verticalPadding",
        options: getSpacingOptions(),
        default: "0px",
      },
      horizontalPadding: {
        label: "Horizontal Padding",
        type: "select",
        plugin: "horizontalPadding",
        options: getSpacingOptions(),
        default: "0px",
      },
      maxWidth: {
        label: "Maximum Width",
        type: "select",
        plugin: "maxWidth",
        options: [
          { label: "2XL", value: "1536px" },
          { label: "XL", value: "1280px" },
          { label: "LG", value: "1024px" },
        ],
        default: "1280px",
      },
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
    },
  },
  button: {
    label: "Button",
    styles: {
      borderRadius: {
        label: "Border Radius",
        type: "number",
        plugin: "borderRadius",
        default: 20,
      },
      primary: {
        label: "Primary Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
      primaryForeground: {
        label: "Primary Foreground Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-foreground)",
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: getWeightOptions(),
        default: "400",
      },
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 12,
      },
    },
  },
  page: {
    label: "Page",
    styles: {
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
      footer: {
        label: "Footer Background Color",
        type: "color",
        plugin: "backgroundColor",
        default: "#000000",
      },
    },
  },
};

const marketerTailwindConfig: TailwindConfig = {
  colors: {
    "palette-primary": "var(--colors-palette-primary)",
    "palette-secondary": "var(--colors-palette-secondary)",
    "palette-accent": "var(--colors-palette-accent)",
    "palette-text": "var(--colors-palette-text)",
    "palette-background": {
      light: "var(--colors-palette-background-light)",
      DEFAULT: "var(--colors-palette-background-DEFAULT)",
      dark: "var(--colors-palette-background-dark)",
    },
    "palette-foreground": "var(--colors-palette-foreground)",
    "heading1-color": "var(--colors-heading1-color)",
    "heading2-color": "var(--colors-heading2-color)",
    "heading3-color": "var(--colors-heading3-color)",
    "heading4-color": "var(--colors-heading4-color)",
    "heading5-color": "var(--colors-heading5-color)",
    "heading6-color": "var(--colors-heading6-color)",
    "body-color": {
      light: "var(--colors-body-color-light)",
      dark: "var(--colors-body-color-dark)",
    },
    "button-primary": "var(--colors-button-primary)",
    "button-primaryForeground": "var(--colors-button-primaryForeground)",
  },
  fontSize: {
    "heading1-fontSize": "var(--fontSize-heading1-fontSize)",
    "heading2-fontSize": "var(--fontSize-heading2-fontSize)",
    "heading3-fontSize": "var(--fontSize-heading3-fontSize)",
    "heading4-fontSize": "var(--fontSize-heading4-fontSize)",
    "heading5-fontSize": "var(--fontSize-heading5-fontSize)",
    "heading6-fontSize": "var(--fontSize-heading6-fontSize)",
    "body-fontSize": "var(--fontSize-body-fontSize)",
    "button-fontSize": "var(--fontSize-button-fontSize)",
  },
  fontWeight: {
    "heading1-fontWeight": "var(--fontWeight-heading1-fontWeight)",
    "heading2-fontWeight": "var(--fontWeight-heading2-fontWeight)",
    "heading3-fontWeight": "var(--fontWeight-heading3-fontWeight)",
    "heading4-fontWeight": "var(--fontWeight-heading4-fontWeight)",
    "heading5-fontWeight": "var(--fontWeight-heading5-fontWeight)",
    "heading6-fontWeight": "var(--fontWeight-heading6-fontWeight)",
    "body-fontWeight": "var(--fontWeight-body-fontWeight)",
    "button-fontWeight": "var(--fontWeight-button-fontWeight)",
  },
  gap: {
    "pageSection-gap": "var(--gap-pageSection-gap)",
  },
  maxWidth: {
    "pageSection-maxWidth": "var(--maxWidth-pageSection-maxWidth)",
  },
  verticalPadding: {
    "pageSection-verticalPadding":
      "var(--verticalPadding-pageSection-verticalPadding)",
  },
  horizontalPadding: {
    "pageSection-horizontalPadding":
      "var(--horizontalPadding-pageSection-horizontalPadding)",
  },
  backgroundColor: {
    "pageSection-backgroundColor":
      "var(--backgroundColor-pageSection-backgroundColor)",
    "page-backgroundColor": "var(--backgroundColor-page-backgroundColor)",
    "page-footer": "var(--backgroundColor-page-footer)",
  },
  borderRadius: {
    "button-borderRadius": "var(--borderRadius-button-borderRadius)",
  },
};

const developerTailwindConfig: TailwindConfig = {
  colors: {
    ring: "var(--colors-ring)",
    "button-primary": "#000000",
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
    ring: "var(--colors-ring)", // from developer tailwindConfig
    "palette-primary": "var(--colors-palette-primary)",
    "palette-secondary": "var(--colors-palette-secondary)",
    "palette-accent": "var(--colors-palette-accent)",
    "palette-text": "var(--colors-palette-text)",
    "palette-background": {
      light: "var(--colors-palette-background-light)",
      DEFAULT: "var(--colors-palette-background-DEFAULT)",
      dark: "var(--colors-palette-background-dark)",
    },
    "palette-foreground": "var(--colors-palette-foreground)",
    "heading1-color": "var(--colors-heading1-color)",
    "heading2-color": "var(--colors-heading2-color)",
    "heading3-color": "var(--colors-heading3-color)",
    "heading4-color": "var(--colors-heading4-color)",
    "heading5-color": "var(--colors-heading5-color)",
    "heading6-color": "var(--colors-heading6-color)",
    "body-color": {
      light: "var(--colors-body-color-light)",
      dark: "var(--colors-body-color-dark)",
    },
    "button-primary": "var(--colors-button-primary)", // theme.config takes priority
    "button-primaryForeground": "var(--colors-button-primaryForeground)",
  },
  fontSize: {
    "heading1-fontSize": "var(--fontSize-heading1-fontSize)",
    "heading2-fontSize": "var(--fontSize-heading2-fontSize)",
    "heading3-fontSize": "var(--fontSize-heading3-fontSize)",
    "heading4-fontSize": "var(--fontSize-heading4-fontSize)",
    "heading5-fontSize": "var(--fontSize-heading5-fontSize)",
    "heading6-fontSize": "var(--fontSize-heading6-fontSize)",
    "body-fontSize": "var(--fontSize-body-fontSize)",
    "button-fontSize": "var(--fontSize-button-fontSize)",
  },
  fontWeight: {
    "heading1-fontWeight": "var(--fontWeight-heading1-fontWeight)",
    "heading2-fontWeight": "var(--fontWeight-heading2-fontWeight)",
    "heading3-fontWeight": "var(--fontWeight-heading3-fontWeight)",
    "heading4-fontWeight": "var(--fontWeight-heading4-fontWeight)",
    "heading5-fontWeight": "var(--fontWeight-heading5-fontWeight)",
    "heading6-fontWeight": "var(--fontWeight-heading6-fontWeight)",
    "body-fontWeight": "var(--fontWeight-body-fontWeight)",
    "button-fontWeight": "var(--fontWeight-button-fontWeight)",
  },
  gap: {
    "pageSection-gap": "var(--gap-pageSection-gap)",
  },
  maxWidth: {
    "pageSection-maxWidth": "var(--maxWidth-pageSection-maxWidth)",
  },
  verticalPadding: {
    "pageSection-verticalPadding":
      "var(--verticalPadding-pageSection-verticalPadding)",
  },
  horizontalPadding: {
    "pageSection-horizontalPadding":
      "var(--horizontalPadding-pageSection-horizontalPadding)",
  },
  backgroundColor: {
    "pageSection-backgroundColor":
      "var(--backgroundColor-pageSection-backgroundColor)",
    "page-backgroundColor": "var(--backgroundColor-page-backgroundColor)",
    "page-footer": "var(--backgroundColor-page-footer)",
  },
  borderRadius: {
    "button-borderRadius": "var(--borderRadius-button-borderRadius)",
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
