import { describe, it, expect } from "vitest";
import { applyTheme, Document } from "./applyTheme.ts";
import { ThemeConfig } from "./themeResolver.ts";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override in c_theme", () => {
    const document: Document = {
      siteId: 123,
      _site: {
        pagesTheme: [
          {
            themeConfiguration: {
              data: JSON.stringify({ "--colors-palette-text": "red" }),
              siteId: 123,
            },
          },
        ],
      },
    };
    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      defaultGoogleFontsLinkTags +
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
      _site: {
        pagesTheme: [
          {
            themeConfiguration: {
              data: JSON.stringify({
                "--colors-palette-primary-DEFAULT": "hsl(0 68% 51%)",
                "--colors-palette-primary-foreground": "hsl(0 0% 100%)",
                "--borderRadius-border-lg": "20px",
              }),
              siteId: 123,
            },
          },
        ],
      },
    };

    const result = applyTheme(document, themeConfig);

    expect(result).toBe(
      defaultGoogleFontsLinkTags +
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

  it("should return the base string unmodified when themeConfig is empty", () => {
    const base = "<style>div{color:blue}</style>";
    const result = applyTheme({} as Document, {}, base);

    expect(result).toBe(base);
  });

  it("should ignore saved values that are no longer in the themeConfig", () => {
    const document: Document = {
      _site: {
        pagesTheme: [
          {
            themeConfiguration: { data: JSON.stringify({ "--absdag": "red" }) },
          },
        ],
      },
    };
    const result = applyTheme(document, themeConfig);

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

const defaultGoogleFontsLinkTags =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Asap:ital,wght@0,100..900;1,100..900' +
  "&family=Bitter:ital,wght@0,100..900;1,100..900&family=Cabin:ital,wght@0,400..700;1,400..700&family=Cinzel:wght@400..900&family=EB+Garamond:ital,wght@0,400..800;1,400..800" +
  "&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Inconsolata:wght@200..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lora:ital,wght@0,400..700;1,400..700" +
  "&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900" +
  "&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Flex:wght@100..900&family=Roboto+Slab:wght@100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900" +
  '&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">';
