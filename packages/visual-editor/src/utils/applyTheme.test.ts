import { describe, it, expect } from "vitest";
import { applyTheme, Document } from "./applyTheme.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { defaultGoogleFontsLinkTags } from "./font_registry.js";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override in c_theme", () => {
    const document: Document = {
      siteId: 123,
      __: {
        theme: JSON.stringify({ "--colors-palette-text": "red" }),
      },
    };
    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:red !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:8px !important;" +
        "--borderRadius-border-sm:4px !important" +
        "}</style>"
    );
  });

  it("should generate correct CSS with multiple overrides in c_theme", () => {
    const document: Document = {
      siteId: 123,
      __: {
        theme: JSON.stringify({
          "--colors-palette-primary-DEFAULT": "hsl(0 68% 51%)",
          "--colors-palette-primary-foreground": "hsl(0 0% 100%)",
          "--borderRadius-border-lg": "20px",
        }),
      },
    };

    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:black !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:20px !important;" +
        "--borderRadius-border-sm:4px !important" +
        "}</style>"
    );
  });

  it("should return default values for an empty c_theme field", () => {
    const result = applyTheme({} as Document, themeConfig);

    expect(result).toBe(
      defaultGoogleFontsLinkTags +
        '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:black !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:8px !important;" +
        "--borderRadius-border-sm:4px !important" +
        "}</style>"
    );
  });

  it("should return font style tag only for fonts in theme", () => {
    const document: Document = {
      siteId: 123,
      __: {
        theme: JSON.stringify({
          "--fontFamily-button-fontFamily": "'Adamina', serif",
        }),
      },
    };

    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
        '<link href="https://fonts.googleapis.com/css2?family=Adamina:wght@400&display=swap" rel="stylesheet">' +
        '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:black !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:8px !important;" +
        "--borderRadius-border-sm:4px !important" +
        "}</style>"
    );
  });

  it("should return the base string unmodified when themeConfig is empty", () => {
    const base = "<style>div{color:blue}</style>";
    const result = applyTheme({} as Document, {}, base);

    expect(result).toBe(base);
  });

  it("should ignore saved values that are no longer in the themeConfig", () => {
    const document: Document = {
      __: {
        theme: JSON.stringify({ "--absdag": "red" }),
      },
    };
    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:black !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:8px !important;" +
        "--borderRadius-border-sm:4px !important" +
        "}</style>"
    );
  });

  it("should generate contrasting palette colors", () => {
    const document: Document = {
      __: {
        theme: JSON.stringify({ "--colors-palette-primary": "#7ED321" }),
      },
    };
    const result = applyTheme(document, {
      palette: {
        label: "Colors",
        styles: {
          primary: {
            label: "Primary",
            plugin: "colors",
            type: "color",
            default: "#000000",
          },
        },
      },
    });

    expect(result).toBe(
      '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-primary:#7ED321 !important;" +
        "--colors-palette-primary-contrast:#FFFFFF !important" +
        "}</style>"
    );
  });
});

const themeConfig: ThemeConfig = {
  palette: {
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
        plugin: "colors",
        styles: {
          DEFAULT: {
            label: "Default",
            type: "color",
            default: "hsl(0 68% 51%)",
          },
          foreground: {
            label: "Default",
            type: "color",
            default: "hsl(0 0% 100%)",
          },
        },
      },
    },
  },
  border: {
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
