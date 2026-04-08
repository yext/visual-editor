import { describe, it, expect } from "vitest";
import { buildCustomFontPreloads } from "./customFontPreloads.ts";
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

describe("buildCustomFontPreloads", () => {
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
      Alpha: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
      },
      Beta: {
        italics: false,
        weights: [300, 400],
        fallback: "serif",
      },
    };

    const customFontCssIndex = {
      Alpha: {
        variableSrcByStyle: {},
        staticSrcByStyleAndWeight: {
          normal: {
            700: "/y-fonts/alpha-bold.woff2",
          },
          italic: {},
        },
      },
      Beta: {
        variableSrcByStyle: {},
        staticSrcByStyleAndWeight: {
          normal: {
            400: "/y-fonts/beta-regular.woff2",
          },
          italic: {},
        },
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

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues,
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toHaveLength(2);
    expect(preloads).toEqual(
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
        italics: true,
        weights: [300, 400, 500, 600],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Gamma: {
        variableSrcByStyle: {
          normal: "/y-fonts/gamma-variable.woff2",
          italic: "/y-fonts/gamma-variable-italic.woff2",
        },
        staticSrcByStyleAndWeight: {
          normal: {
            500: "/y-fonts/gamma-500.woff2",
          },
          italic: {
            500: "/y-fonts/gamma-500-italic.woff2",
          },
        },
      },
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Gamma', sans-serif",
        "--fontWeight-body-fontWeight": "500",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual(["/y-fonts/gamma-variable-italic.woff2"]);
  });

  it("uses italic static files when italic is selected", () => {
    const themeConfig = createTextThemeConfig("'Delta', sans-serif", "600");

    const customFonts: FontRegistry = {
      Delta: {
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Delta: {
        variableSrcByStyle: {},
        staticSrcByStyleAndWeight: {
          normal: {
            600: "/y-fonts/delta-600.woff2",
          },
          italic: {
            600: "/y-fonts/delta-600-italic.woff2",
          },
        },
      },
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Delta', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual(["/y-fonts/delta-600-italic.woff2"]);
  });

  it("omits a preload when italic is selected but no italic asset exists", () => {
    const themeConfig = createTextThemeConfig("'Epsilon', sans-serif", "600");

    const customFonts: FontRegistry = {
      Epsilon: {
        italics: true,
        weights: [400, 600, 700],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Epsilon: {
        variableSrcByStyle: {},
        staticSrcByStyleAndWeight: {
          normal: {
            600: "/y-fonts/epsilon-600.woff2",
          },
          italic: {},
        },
      },
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Epsilon', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "italic",
      },
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual([]);
  });

  it("omits a preload when no matching static weight exists", () => {
    const themeConfig = createTextThemeConfig("'Zeta', sans-serif", "600");

    const customFonts: FontRegistry = {
      Zeta: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Zeta: {
        variableSrcByStyle: {},
        staticSrcByStyleAndWeight: {
          normal: {
            400: "/y-fonts/zeta-regular.woff2",
            700: "/y-fonts/zeta-bold.woff2",
          },
          italic: {},
        },
      },
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues: {
        "--fontFamily-body-fontFamily": "'Zeta', sans-serif",
        "--fontWeight-body-fontWeight": "600",
        "--fontStyle-body-fontStyle": "normal",
      },
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual([]);
  });
});
