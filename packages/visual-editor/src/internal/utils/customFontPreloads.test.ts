import { describe, it, expect } from "vitest";
import { buildCustomFontAssets } from "./customFontPreloads.ts";
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
  it("returns all matching custom font files for multiple fonts", () => {
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
      "alpha-font-key": {
        name: "alpha-font",
        displayName: "Alpha",
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/alpha.css",
        variants: [
          {
            fontStyle: "normal",
            fontWeight: 400,
            fontFilePath: "/y-fonts/alpha-regular.woff2",
          },
          {
            fontStyle: "normal",
            fontWeight: 700,
            fontFilePath: "/y-fonts/alpha-bold.woff2",
          },
        ],
      },
      "beta-font-key": {
        name: "beta-font",
        displayName: "Beta",
        italics: false,
        weights: [300, 400],
        fallback: "serif",
        fontFacePath: "y-fonts/beta.css",
        variants: [
          {
            fontStyle: "normal",
            fontWeight: 400,
            fontFilePath: "/y-fonts/beta-regular.woff2",
          },
          {
            fontStyle: "normal",
            fontWeight: 300,
            fontFilePath: "/y-fonts/beta-light.woff2",
          },
        ],
      },
    };

    const themeValues = {
      "--fontFamily-h1-fontFamily": "'Alpha', sans-serif",
      "--fontWeight-h1-fontWeight": "700",
      "--fontStyle-h1-fontStyle": "normal",
      "--fontFamily-body-fontFamily": "'Beta', serif",
      "--fontWeight-body-fontWeight": "400",
      "--fontStyle-body-fontStyle": "normal",
    };

    const assets = buildCustomFontAssets({
      themeConfig,
      themeValues,
      customFonts,
    });

    expect(assets.fontFacePaths).toEqual([
      "y-fonts/alpha.css",
      "y-fonts/beta.css",
    ]);
    expect(assets.preloads).toHaveLength(2);
    expect(assets.preloads).toEqual(
      expect.arrayContaining([
        "/y-fonts/alpha-bold.woff2",
        "/y-fonts/beta-regular.woff2",
      ])
    );
  });

  it("prefers variable font files for the selected font style", () => {
    const themeConfig = createTextThemeConfig("'Gamma', sans-serif", "500");

    const customFonts: FontRegistry = {
      Gamma: {
        name: "gamma-font",
        displayName: "Gamma",
        italics: true,
        weights: [300, 400, 500, 600],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/gamma.css",
        variants: [
          {
            fontStyle: "normal",
            minWeight: 300,
            maxWeight: 600,
            fontFilePath: "/y-fonts/gamma-variable.woff2",
          },
          {
            fontStyle: "italic",
            minWeight: 300,
            maxWeight: 600,
            fontFilePath: "/y-fonts/gamma-variable-italic.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Gamma', sans-serif",
        "--fontWeight-body-fontWeight": "500",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
    });

    expect(assets.fontFacePaths).toEqual(["y-fonts/gamma.css"]);
    expect(assets.preloads).toEqual(["/y-fonts/gamma-variable-italic.woff2"]);
  });

  it("uses italic static files when italic is selected", () => {
    const themeConfig = createTextThemeConfig("'Delta', sans-serif", "600");

    const customFonts: FontRegistry = {
      Delta: {
        name: "delta-font",
        displayName: "Delta",
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/delta.css",
        variants: [
          {
            fontStyle: "normal",
            fontWeight: 600,
            fontFilePath: "/y-fonts/delta-600.woff2",
          },
          {
            fontStyle: "italic",
            fontWeight: 600,
            fontFilePath: "/y-fonts/delta-600-italic.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig,
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
    const themeConfig = createTextThemeConfig("'Epsilon', sans-serif", "600");

    const customFonts: FontRegistry = {
      Epsilon: {
        name: "epsilon-font",
        displayName: "Epsilon",
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/epsilon.css",
        variants: [
          {
            fontStyle: "normal",
            fontWeight: 600,
            fontFilePath: "/y-fonts/epsilon-600.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig,
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
    const themeConfig = createTextThemeConfig("'Zeta', sans-serif", "600");

    const customFonts: FontRegistry = {
      Zeta: {
        name: "zeta-font",
        displayName: "Zeta",
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/zeta.css",
        variants: [
          {
            fontStyle: "normal",
            fontWeight: 400,
            fontFilePath: "/y-fonts/zeta-regular.woff2",
          },
          {
            fontStyle: "normal",
            fontWeight: 700,
            fontFilePath: "/y-fonts/zeta-bold.woff2",
          },
        ],
      },
    };

    const assets = buildCustomFontAssets({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Zeta', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "normal",
      },
      customFonts,
    });

    expect(assets.preloads).toEqual([]);
  });

  it("returns custom font face paths for the custom fonts used by the theme", () => {
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

    const customFonts: FontRegistry = {
      "alpha-font-key": {
        name: "alpha-font-regular",
        displayName: "Alpha",
        italics: false,
        weights: [400],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/alpha.css",
        variants: [],
      },
    };

    expect(
      buildCustomFontAssets({
        themeConfig,
        themeValues: {},
        customFonts,
      }).fontFacePaths
    ).toEqual(["y-fonts/alpha.css"]);
  });

  it("deduplicates repeated custom font selections and ignores fonts without face paths", () => {
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

    const customFonts: FontRegistry = {
      alpha: {
        name: "alpha-font-regular",
        displayName: "Alpha",
        italics: false,
        weights: [400],
        fallback: "sans-serif",
        fontFacePath: "y-fonts/alpha.css",
        variants: [],
      },
      nameless: {
        displayName: "Nameless",
        italics: false,
        weights: [400],
        fallback: "sans-serif",
        variants: [],
      },
    };

    expect(
      buildCustomFontAssets({
        themeConfig,
        themeValues: {},
        customFonts,
      }).fontFacePaths
    ).toEqual(["y-fonts/alpha.css"]);
  });
});
