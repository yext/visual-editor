import { describe, it, expect } from "vitest";
import { applyTheme, Document } from "./applyTheme.ts";
import { ThemeConfig } from "./themeResolver.ts";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override in c_theme", () => {
    const document: Document = { c_theme: { "--colors-text": "red" } };
    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-text:red !important;" +
        "--colors-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-lg:8px !important;" +
        "--borderRadius-sm:4px !important" +
        "}</style>"
    );
  });

  it("should generate correct CSS with multiple overrides in c_theme", () => {
    const document: Document = {
      c_theme: {
        "--colors-primary-DEFAULT": "hsl(0 68% 51%)",
        "--colors-primary-foreground": "hsl(0 0% 100%)",
        "--borderRadius-lg": "20px",
      },
    };
    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-text:black !important;" +
        "--colors-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-lg:20px !important;" +
        "--borderRadius-sm:4px !important" +
        "}</style>"
    );
  });

  it("should return default values for an empty c_theme field", () => {
    const result = applyTheme({} as Document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-text:black !important;" +
        "--colors-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-lg:8px !important;" +
        "--borderRadius-sm:4px !important" +
        "}</style>"
    );
  });

  it("should return the base string unmodified when c_theme is empty", () => {
    const base = "<style>div{color:blue}</style>";
    const result = applyTheme({} as Document, {}, base);

    expect(result).toBe(base);
  });

  it("should ignore saved values that are no longer in the themeConfig", () => {
    const result = applyTheme(
      { c_theme: { "--abddef": "red" } } as Document,
      themeConfig
    );

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-text:black !important;" +
        "--colors-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-lg:8px !important;" +
        "--borderRadius-sm:4px !important" +
        "}</style>"
    );
  });
});

const themeConfig: ThemeConfig = {
  colors: {
    label: "Colors",
    styles: {
      text: {
        label: "Text",
        plugin: "colors",
        type: "color",
        default: "black",
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
      sm: {
        label: "Small Border Radius",
        plugin: "borderRadius",
        type: "number",
        default: 4,
      },
    },
  },
};
