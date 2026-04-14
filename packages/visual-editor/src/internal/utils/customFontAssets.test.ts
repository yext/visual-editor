import { describe, it, expect } from "vitest";
import { buildCustomFontAssets } from "./customFontAssets.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { FontRegistry } from "../../utils/fonts/visualEditorFonts.ts";

const createTextThemeConfig = (
  fontFamilyDefault: string,
  fontWeightDefault: string,
  fontStyleDefault = "normal"
): ThemeConfig => ({
  body: {
    label: "Body",
    styles: {
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: [],
        default: fontFamilyDefault,
      },
      fontWeight: {
        label: "Weight",
        type: "select",
        plugin: "fontWeight",
        options: [],
        default: fontWeightDefault,
      },
      fontStyle: {
        label: "Style",
        type: "select",
        plugin: "fontStyle",
        options: [],
        default: fontStyleDefault,
      },
    },
  },
});

describe("buildCustomFontAssets", () => {
  it("returns all matching custom assets for multiple fonts", () => {
    const themeConfig: ThemeConfig = {
      h1: {
        label: "H1",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "700",
          },
          fontStyle: {
            label: "Style",
            type: "select",
            plugin: "fontStyle",
            options: [],
            default: "normal",
          },
        },
      },
      body: {
        label: "Body",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Beta', serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "400",
          },
          fontStyle: {
            label: "Style",
            type: "select",
            plugin: "fontStyle",
            options: [],
            default: "normal",
          },
        },
      },
    };

    const customFonts: FontRegistry = {
      Alpha: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
        facePath: "y-fonts/alpha.css",
        variants: [
          {
            style: "normal",
            weights: [400],
            filePath: "/y-fonts/alpha-regular.woff2",
          },
          {
            style: "normal",
            weights: [700],
            filePath: "/y-fonts/alpha-bold.woff2",
          },
        ],
      },
      Beta: {
        italics: false,
        weights: [300, 400],
        fallback: "serif",
        facePath: "y-fonts/beta.css",
        variants: [
          {
            style: "normal",
            weights: [400],
            filePath: "/y-fonts/beta-regular.woff2",
          },
          {
            style: "normal",
            weights: [300],
            filePath: "/y-fonts/beta-light.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig,
      themeValues: {
        "--fontFamily-h1-fontFamily": "'Alpha', sans-serif",
        "--fontWeight-h1-fontWeight": "700",
        "--fontStyle-h1-fontStyle": "normal",
        "--fontFamily-body-fontFamily": "'Beta', serif",
        "--fontWeight-body-fontWeight": "400",
        "--fontStyle-body-fontStyle": "normal",
      },
      customFonts,
    });

    expect(assets.stylesheetPaths).toEqual([
      "y-fonts/alpha.css",
      "y-fonts/beta.css",
    ]);
    expect(assets.preloads).toEqual([
      "/y-fonts/alpha-bold.woff2",
      "/y-fonts/beta-regular.woff2",
    ]);
  });

  it("prefers variable font files for the selected style", () => {
    const customFonts: FontRegistry = {
      Gamma: {
        italics: true,
        minWeight: 300,
        maxWeight: 600,
        fallback: "sans-serif",
        facePath: "y-fonts/gamma.css",
        variants: [
          {
            style: "normal",
            minWeight: 300,
            maxWeight: 600,
            filePath: "/y-fonts/gamma-variable.woff2",
          },
          {
            style: "italic",
            minWeight: 300,
            maxWeight: 600,
            filePath: "/y-fonts/gamma-variable-italic.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig: createTextThemeConfig("'Gamma', sans-serif", "500"),
      themeValues: {
        "--fontFamily-body-fontFamily": "'Gamma', sans-serif",
        "--fontWeight-body-fontWeight": "500",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
    });

    expect(assets.stylesheetPaths).toEqual(["y-fonts/gamma.css"]);
    expect(assets.preloads).toEqual(["/y-fonts/gamma-variable-italic.woff2"]);
  });

  it("uses italic static files when italic is selected", () => {
    const customFonts: FontRegistry = {
      Delta: {
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
        facePath: "y-fonts/delta.css",
        variants: [
          {
            style: "normal",
            weights: [600],
            filePath: "/y-fonts/delta-600.woff2",
          },
          {
            style: "italic",
            weights: [600],
            filePath: "/y-fonts/delta-600-italic.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig: createTextThemeConfig("'Delta', sans-serif", "600"),
      themeValues: {
        "--fontFamily-body-fontFamily": "'Delta', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
    });

    expect(assets.preloads).toEqual(["/y-fonts/delta-600-italic.woff2"]);
  });

  it("omits a preload when italic is selected but no italic asset exists", () => {
    const customFonts: FontRegistry = {
      Epsilon: {
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
        facePath: "y-fonts/epsilon.css",
        variants: [
          {
            style: "normal",
            weights: [600],
            filePath: "/y-fonts/epsilon-600.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig: createTextThemeConfig("'Epsilon', sans-serif", "600"),
      themeValues: {
        "--fontFamily-body-fontFamily": "'Epsilon', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
    });

    expect(assets.preloads).toEqual([]);
  });

  it("omits a preload when no matching static weight exists", () => {
    const customFonts: FontRegistry = {
      Zeta: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
        facePath: "y-fonts/zeta.css",
        variants: [
          {
            style: "normal",
            weights: [400],
            filePath: "/y-fonts/zeta-regular.woff2",
          },
          {
            style: "normal",
            weights: [700],
            filePath: "/y-fonts/zeta-bold.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig: createTextThemeConfig("'Zeta', sans-serif", "600"),
      themeValues: {
        "--fontFamily-body-fontFamily": "'Zeta', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "normal",
      },
      customFonts,
    });

    expect(assets.preloads).toEqual([]);
  });

  it("returns face paths for the custom fonts used by the theme", () => {
    const themeConfig: ThemeConfig = {
      h1: {
        label: "H1",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
        },
      },
      body: {
        label: "Body",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Roboto', sans-serif",
          },
        },
      },
    };

    expect(
      buildCustomFontAssets({
        themeConfig,
        themeValues: {},
        customFonts: {
          Alpha: {
            italics: false,
            weights: [400],
            fallback: "sans-serif",
            facePath: "y-fonts/alpha.css",
            variants: [],
          },
        },
      }).stylesheetPaths
    ).toEqual(["y-fonts/alpha.css"]);
  });

  it("deduplicates repeated custom font stylesheet paths", () => {
    const themeConfig: ThemeConfig = {
      h1: {
        label: "H1",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
        },
      },
      h2: {
        label: "H2",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
        },
      },
      body: {
        label: "Body",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Nameless', sans-serif",
          },
        },
      },
    };

    expect(
      buildCustomFontAssets({
        themeConfig,
        themeValues: {},
        customFonts: {
          Alpha: {
            italics: false,
            weights: [400],
            fallback: "sans-serif",
            facePath: "y-fonts/alpha.css",
            variants: [],
          },
          Nameless: {
            italics: false,
            weights: [400],
            fallback: "sans-serif",
            facePath: "y-fonts/alpha.css",
            variants: [],
          },
        },
      }).stylesheetPaths
    ).toEqual(["y-fonts/alpha.css"]);
  });

  it("deduplicates repeated preload targets when the same custom font is used twice", () => {
    const themeConfig: ThemeConfig = {
      h1: {
        label: "H1",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "700",
          },
          fontStyle: {
            label: "Style",
            type: "select",
            plugin: "fontStyle",
            options: [],
            default: "normal",
          },
        },
      },
      h2: {
        label: "H2",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Alpha', sans-serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "700",
          },
          fontStyle: {
            label: "Style",
            type: "select",
            plugin: "fontStyle",
            options: [],
            default: "normal",
          },
        },
      },
    };

    expect(
      buildCustomFontAssets({
        themeConfig,
        themeValues: {},
        customFonts: {
          Alpha: {
            italics: false,
            weights: [400, 700],
            fallback: "sans-serif",
            facePath: "y-fonts/alpha.css",
            variants: [
              {
                style: "normal",
                weights: [700],
                filePath: "/y-fonts/alpha-bold.woff2",
              },
            ],
          },
        },
      }).preloads
    ).toEqual(["/y-fonts/alpha-bold.woff2"]);
  });
});
