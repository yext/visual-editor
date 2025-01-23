import { describe, test, expect } from "vitest";
import {
  generateCssVariablesFromPuckFields,
  generateCssVariablesFromThemeConfig,
  internalThemeResolver,
} from "./internalThemeResolver.ts";
import { testThemeConfig } from "../../utils/themeResolver.test.ts";

describe("internalThemeResolver", () => {
  test("combines saved and default values", () => {
    const result = internalThemeResolver(testThemeConfig, savedThemeValues);
    expect(result).toEqual(combinedThemeValues);
  });

  test("works with undefined saved state", () => {
    const result = internalThemeResolver(testThemeConfig, undefined);
    expect(result).toEqual(defaultThemeValues);
  });
});

describe("generateCssVariablesFromThemeConfig", () => {
  test("generates css variables with default values", () => {
    const result = generateCssVariablesFromThemeConfig(testThemeConfig);
    expect(result).toEqual(defaultThemeValues);
  });
});

describe("generateCssVariablesFromPuckFields", () => {
  test("generates css variables from Puck field", () => {
    const result = generateCssVariablesFromPuckFields(
      { primary: "green" },
      "palette",
      {
        label: "Palette",
        styles: {
          primary: {
            label: "Primary",
            type: "color",
            default: "black",
            plugin: "colors",
          },
        },
      }
    );
    expect(result).toEqual({ "--colors-palette-primary": "green" });
  });

  test("generates css variables from nested Puck fields", () => {
    const result = generateCssVariablesFromPuckFields(
      {
        primary: {
          default: "green",
          foreground: "blue",
        },
      },
      "palette",
      {
        label: "Palette",
        styles: {
          primary: {
            label: "Primary",
            plugin: "colors",
            styles: {
              default: {
                label: "Default",
                type: "color",
                default: "black",
              },
              foreground: {
                label: "Foreground",
                type: "color",
                default: "white",
              },
            },
          },
        },
      }
    );
    expect(result).toEqual({
      "--colors-palette-primary-default": "green",
      "--colors-palette-primary-foreground": "blue",
    });
  });
});

const defaultThemeValues = {
  "--colors-palette-primary": "#D83B18",
  "--colors-palette-secondary": "#871900",
  "--colors-palette-accent": "#FFFFFF",
  "--colors-palette-text": "#000000",
  "--colors-palette-background-light": "#FFFFFF",
  "--colors-palette-background-DEFAULT": "#F7F7F7",
  "--colors-palette-background-dark": "#F0F0F0",
  "--colors-palette-foreground": "#000000",
  "--colors-heading1-color": "var(--colors-palette-primary)",
  "--colors-heading2-color": "var(--colors-palette-primary)",
  "--colors-heading3-color": "var(--colors-palette-primary)",
  "--colors-heading4-color": "var(--colors-palette-secondary)",
  "--colors-heading5-color": "var(--colors-palette-secondary)",
  "--colors-heading6-color": "var(--colors-palette-secondary)",
  "--colors-body-color-light": "var(--colors-palette-text)",
  "--colors-body-color-dark": "var(--colors-palette-text)",
  "--colors-button-primary": "var(--colors-palette-primary)",
  "--colors-button-primaryForeground": "var(--colors-palette-foreground)",
  "--fontSize-heading1-fontSize": "24px",
  "--fontSize-heading2-fontSize": "24px",
  "--fontSize-heading3-fontSize": "24px",
  "--fontSize-heading4-fontSize": "24px",
  "--fontSize-heading5-fontSize": "24px",
  "--fontSize-heading6-fontSize": "24px",
  "--fontSize-body-fontSize": "12px",
  "--fontSize-button-fontSize": "12px",
  "--fontWeight-heading1-fontWeight": "700",
  "--fontWeight-heading2-fontWeight": "700",
  "--fontWeight-heading3-fontWeight": "700",
  "--fontWeight-heading4-fontWeight": "700",
  "--fontWeight-heading5-fontWeight": "700",
  "--fontWeight-heading6-fontWeight": "700",
  "--fontWeight-body-fontWeight": "400",
  "--fontWeight-button-fontWeight": "400",
  "--gap-grid-verticalSpacing": "8px",
  "--backgroundColor-grid-backgroundColor": "var(--colors-palette-background)",
  "--backgroundColor-page-backgroundColor": "var(--colors-palette-background)",
  "--backgroundColor-page-footer": "#000000",
  "--maxWidth-grid-maxWidth": "1280px",
  "--borderRadius-button-borderRadius": "20px",
};

const savedThemeValues = {
  "--colors-palette-text": "grey",
  "--colors-palette-background-DEFAULT": "#EEEEEE",
  "--gap-grid-verticalSpacing": "16px",
  "--fontWeight-heading1-fontWeight": "900",
  "--backgroundColor-grid-backgroundColor": "var(--colors-palette-primary)",
};

const combinedThemeValues = {
  "--colors-palette-primary": "#D83B18",
  "--colors-palette-secondary": "#871900",
  "--colors-palette-accent": "#FFFFFF",
  "--colors-palette-text": "grey", // from saved theme
  "--colors-palette-background-light": "#FFFFFF",
  "--colors-palette-background-DEFAULT": "#EEEEEE", // from saved theme
  "--colors-palette-background-dark": "#F0F0F0",
  "--colors-palette-foreground": "#000000",
  "--colors-heading1-color": "var(--colors-palette-primary)",
  "--colors-heading2-color": "var(--colors-palette-primary)",
  "--colors-heading3-color": "var(--colors-palette-primary)",
  "--colors-heading4-color": "var(--colors-palette-secondary)",
  "--colors-heading5-color": "var(--colors-palette-secondary)",
  "--colors-heading6-color": "var(--colors-palette-secondary)",
  "--colors-body-color-light": "var(--colors-palette-text)",
  "--colors-body-color-dark": "var(--colors-palette-text)",
  "--colors-button-primary": "var(--colors-palette-primary)",
  "--colors-button-primaryForeground": "var(--colors-palette-foreground)",
  "--fontSize-heading1-fontSize": "24px",
  "--fontSize-heading2-fontSize": "24px",
  "--fontSize-heading3-fontSize": "24px",
  "--fontSize-heading4-fontSize": "24px",
  "--fontSize-heading5-fontSize": "24px",
  "--fontSize-heading6-fontSize": "24px",
  "--fontSize-body-fontSize": "12px",
  "--fontSize-button-fontSize": "12px",
  "--fontWeight-heading1-fontWeight": "900", // from saved theme
  "--fontWeight-heading2-fontWeight": "700",
  "--fontWeight-heading3-fontWeight": "700",
  "--fontWeight-heading4-fontWeight": "700",
  "--fontWeight-heading5-fontWeight": "700",
  "--fontWeight-heading6-fontWeight": "700",
  "--fontWeight-body-fontWeight": "400",
  "--fontWeight-button-fontWeight": "400",
  "--gap-grid-verticalSpacing": "16px", // from saved theme
  "--backgroundColor-grid-backgroundColor": "var(--colors-palette-primary)", // from saved theme
  "--backgroundColor-page-backgroundColor": "var(--colors-palette-background)",
  "--backgroundColor-page-footer": "#000000",
  "--maxWidth-grid-maxWidth": "1280px",
  "--borderRadius-button-borderRadius": "20px",
};
