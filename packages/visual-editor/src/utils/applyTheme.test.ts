import { describe, it, expect } from "vitest";
import { applyTheme } from "./applyTheme.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { StreamDocument } from "./types/StreamDocument.ts";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override in c_theme", () => {
    const streamDocument: StreamDocument = {
      siteId: 123,
      __: {
        theme: JSON.stringify({ "--colors-palette-text": "red" }),
      },
    };
    const result = applyTheme(streamDocument, "./", themeConfig);

    // Should include Google Font links and the CSS style tag
    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain(
      '<style id="visual-editor-theme" type="text/css">.components{'
    );
    expect(result).toContain("--colors-palette-text:red !important;");
    expect(result).toContain(
      "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;"
    );
    expect(result).toContain(
      "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;"
    );
    expect(result).toContain("--borderRadius-border-lg:8px !important;");
    expect(result).toContain("--borderRadius-border-sm:4px !important");
  });

  it("should generate correct CSS with multiple overrides in c_theme", () => {
    const streamDocument: StreamDocument = {
      siteId: 123,
      __: {
        theme: JSON.stringify({
          "--colors-palette-primary-DEFAULT": "hsl(0 68% 51%)",
          "--colors-palette-primary-foreground": "hsl(0 0% 100%)",
          "--fontFamily-h1-fontFamily": "'Roboto', sans-serif",
          "--fontFamily-h2-fontFamily": "'Yext Custom', serif",
          "--borderRadius-border-lg": "20px",
          __customFontPreload: {
            "Yext Custom": { kind: "static", weights: ["700"] },
          },
        }),
      },
    };

    const result = applyTheme(streamDocument, "./", themeConfig);

    // Should include Google Font links and the CSS style tag
    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain(
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">'
    );
    expect(result).toContain(
      '<link href="./y-fonts/yextcustom.css" rel="stylesheet">'
    );
    expect(result).toContain(
      '<link rel="preload" href="./y-fonts/yextcustom-700.woff2" as="font" type="font/woff2" crossorigin="anonymous">'
    );
    expect(result).toContain(
      '<style id="visual-editor-theme" type="text/css">.components{'
    );
    expect(result).toContain("--colors-palette-text:black !important;");
    expect(result).toContain(
      "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;"
    );
    expect(result).toContain(
      "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;"
    );
    expect(result).toContain("--borderRadius-border-lg:20px !important;");
    expect(result).toContain("--borderRadius-border-sm:4px !important");
  });

  it("should return default values for an empty c_theme field", () => {
    const result = applyTheme({} as StreamDocument, "./", themeConfig);

    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain(
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
    const streamDocument: StreamDocument = {
      siteId: 123,
      __: {
        theme: JSON.stringify({
          "--fontFamily-button-fontFamily":
            "'Adamina', 'Adamina Fallback', serif",
          "--fontFamily-h2-fontFamily":
            "'Yext Custom', 'Yext Custom Fallback', serif",
          __customFontPreload: {
            "Yext Custom": { kind: "static", weights: ["700"] },
          },
        }),
      },
    };

    const result = applyTheme(streamDocument, "./", themeConfig);

    expect(result).toBe(
      '<link rel="preload" href="./y-fonts/yextcustom-700.woff2" as="font" type="font/woff2" crossorigin="anonymous">\n' +
        '<link href="./y-fonts/yextcustom.css" rel="stylesheet">\n' +
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">\n' +
        '<link href="https://fonts.googleapis.com/css2?family=Adamina:wght@400&display=swap" rel="stylesheet">' +
        '<style type="text/css">@font-face {\n  font-family: "Adamina Fallback";\n  src: local(\'Georgia\');\n  ' +
        "ascent-override: 100.1884%;\n  descent-override: 27.1032%;\n  size-adjust: 106.9985%;\n  font-weight: 400;\n  font-style: regular;\n}</style>" +
        '<style id="visual-editor-theme" type="text/css">.components{' +
        "--colors-palette-text:black !important;" +
        "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;" +
        "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;" +
        "--borderRadius-border-lg:8px !important;" +
        "--borderRadius-border-sm:4px !important;" +
        "--fontFamily-button-fontFamily:'Adamina', 'Adamina Fallback', serif !important;" +
        "--fontFamily-h2-fontFamily:'Yext Custom', 'Yext Custom Fallback', serif !important" +
        "}</style>"
    );
  });

  it("should return the base string unmodified when themeConfig is empty", () => {
    const base = "<style>div{color:blue}</style>";
    const result = applyTheme({} as StreamDocument, "./", {}, base);

    expect(result).toBe(base);
  });

  it("should not include custom font preload metadata in CSS output", () => {
    const streamDocument: StreamDocument = {
      siteId: 123,
      __: {
        theme: JSON.stringify({
          "--fontFamily-h2-fontFamily": "'Yext Custom', serif",
          __customFontPreload: {
            "Yext Custom": { kind: "static", weights: ["700"] },
          },
        }),
      },
    };

    const result = applyTheme(streamDocument, "./", themeConfig);
    expect(result).not.toContain("__customFontPreload");
  });

  it("should ignore saved values that are no longer in the themeConfig", () => {
    const streamDocument: StreamDocument = {
      __: {
        theme: JSON.stringify({ "--absdag": "red" }),
      },
    };
    const result = applyTheme(streamDocument, "./", themeConfig);

    // Should include Google Font links and the CSS style tag
    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain(
      '<style id="visual-editor-theme" type="text/css">.components{'
    );
    expect(result).toContain("--colors-palette-text:black !important;");
    expect(result).toContain(
      "--colors-palette-primary-DEFAULT:hsl(0 68% 51%) !important;"
    );
    expect(result).toContain(
      "--colors-palette-primary-foreground:hsl(0 0% 100%) !important;"
    );
    expect(result).toContain("--borderRadius-border-lg:8px !important;");
    expect(result).toContain("--borderRadius-border-sm:4px !important");
  });

  it("should generate contrasting palette colors", () => {
    const streamDocument: StreamDocument = {
      __: {
        theme: JSON.stringify({
          "--colors-palette-primary": "#7ED321",
          "--colors-palette-secondary": "#305af3",
        }),
      },
    };
    const result = applyTheme(streamDocument, "./", {
      palette: {
        label: "Colors",
        styles: {
          primary: {
            label: "Primary",
            plugin: "colors",
            type: "color",
            default: "#000000",
          },
          secondary: {
            label: "Secondary",
            plugin: "colors",
            type: "color",
            default: "#000000",
          },
        },
      },
    });

    // Should include Google Font links and the CSS style tag
    expect(result).toContain("fonts.googleapis.com");
    expect(result).toContain(
      '<style id="visual-editor-theme" type="text/css">.components{'
    );
    expect(result).toContain("--colors-palette-primary:#7ED321 !important");
    expect(result).toContain(
      "--colors-palette-primary-contrast:#000000 !important"
    );
    expect(result).toContain(
      "--colors-palette-secondary-contrast:#FFFFFF !important"
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
