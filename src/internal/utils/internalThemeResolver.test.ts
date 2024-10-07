import { describe, test, expect } from "vitest";
import {
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

describe("generateCssVariables", () => {
  test("generates css variables with default values", () => {
    const result = generateCssVariablesFromThemeConfig(testThemeConfig);
    expect(result).toEqual(defaultThemeValues);
  });
});

const defaultThemeValues = {
  "--colors-text": "black",
  "--borderRadius-lg": "8px",
  "--borderRadius-md": "6px",
  "--borderRadius-sm": "4px",
  "--colors-accent-DEFAULT": "hsl(166 55% 67%)",
  "--colors-accent-foreground": "hsl(0 0% 0%)",
  "--colors-background": "hsl(0 0% 100%)",
  "--colors-border": "hsl(214 100% 39%)",
  "--colors-destructive-DEFAULT": "hsl(0 100% 50%)",
  "--colors-destructive-foreground": "hsl(210 40% 98%)",
  "--colors-foreground": "hsl(0 2% 11%)",
  "--colors-input": "hsl(214.3 31.8% 91.4%)",
  "--colors-muted-DEFAULT": "hsl(210 40% 96.1%)",
  "--colors-muted-foreground": "hsl(215.4 16.3% 46.9%)",
  "--colors-popover-DEFAULT": "hsl(225 7% 12%)",
  "--colors-popover-foreground": "hsl(0 0% 100%)",
  "--colors-primary-DEFAULT": "hsl(0 68% 51%)",
  "--colors-primary-foreground": "hsl(0 0% 100%)",
  "--colors-ring": "hsl(215 20.2% 65.1%)",
  "--colors-secondary-DEFAULT": "hsl(11 100% 26%)",
  "--colors-secondary-foreground": "hsl(0 0% 100%)",
};

const savedThemeValues = {
  "--colors-text": "grey",
  "--borderRadius-lg": "16px",
  "--borderRadius-md": "12px",
  "--borderRadius-sm": "8px",
  "--colors-secondary-DEFAULT": "#FF0000",
  "--colors-secondary-foreground": "#0000FF",
};

const combinedThemeValues = {
  "--colors-text": "grey",
  "--borderRadius-lg": "16px",
  "--borderRadius-md": "12px",
  "--borderRadius-sm": "8px",
  "--colors-accent-DEFAULT": "hsl(166 55% 67%)",
  "--colors-accent-foreground": "hsl(0 0% 0%)",
  "--colors-background": "hsl(0 0% 100%)",
  "--colors-border": "hsl(214 100% 39%)",
  "--colors-destructive-DEFAULT": "hsl(0 100% 50%)",
  "--colors-destructive-foreground": "hsl(210 40% 98%)",
  "--colors-foreground": "hsl(0 2% 11%)",
  "--colors-input": "hsl(214.3 31.8% 91.4%)",
  "--colors-muted-DEFAULT": "hsl(210 40% 96.1%)",
  "--colors-muted-foreground": "hsl(215.4 16.3% 46.9%)",
  "--colors-popover-DEFAULT": "hsl(225 7% 12%)",
  "--colors-popover-foreground": "hsl(0 0% 100%)",
  "--colors-primary-DEFAULT": "hsl(0 68% 51%)",
  "--colors-primary-foreground": "hsl(0 0% 100%)",
  "--colors-ring": "hsl(215 20.2% 65.1%)",
  "--colors-secondary-DEFAULT": "#FF0000",
  "--colors-secondary-foreground": "#0000FF",
};
