import { describe, it, expect } from "vitest";
import { buildCustomFontPreloads } from "./customFontPreloads.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { FontRegistry } from "../../utils/fonts/visualEditorFonts.ts";

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
        staticSrcByWeight: {
          700: "/y-fonts/alpha-bold.woff2",
        },
      },
      Beta: {
        staticSrcByWeight: {
          400: "/y-fonts/beta-regular.woff2",
        },
      },
    };

    const themeValues = {
      "--fontFamily-h1-fontFamily": "'Alpha', sans-serif",
      "--fontWeight-h1-fontWeight": "700",
      "--fontFamily-body-fontFamily": "'Beta', serif",
      "--fontWeight-body-fontWeight": "400",
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

  it("prefers variable font files regardless of selected weight", () => {
    const themeConfig: ThemeConfig = {
      body: {
        label: "Body",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Gamma', sans-serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "500",
          },
        },
      },
    };

    const customFonts: FontRegistry = {
      Gamma: {
        italics: false,
        weights: [300, 400, 500, 600],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Gamma: {
        variableSrc: "/y-fonts/gamma-variable.woff2",
        staticSrcByWeight: {
          500: "/y-fonts/gamma-500.woff2",
        },
      },
    };

    const themeValues = {
      "--fontFamily-body-fontFamily": "'Gamma', sans-serif",
      "--fontWeight-body-fontWeight": "500",
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues,
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual(["/y-fonts/gamma-variable.woff2"]);
  });

  it("omits a preload when no matching static weight exists", () => {
    const themeConfig: ThemeConfig = {
      body: {
        label: "Body",
        styles: {
          fontFamily: {
            label: "Font",
            type: "select",
            plugin: "fontFamily",
            options: [],
            default: "'Delta', sans-serif",
          },
          fontWeight: {
            label: "Weight",
            type: "select",
            plugin: "fontWeight",
            options: [],
            default: "600",
          },
        },
      },
    };

    const customFonts: FontRegistry = {
      Delta: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
      },
    };

    const customFontCssIndex = {
      Delta: {
        staticSrcByWeight: {
          400: "/y-fonts/delta-regular.woff2",
          700: "/y-fonts/delta-bold.woff2",
        },
      },
    };

    const themeValues = {
      "--fontFamily-body-fontFamily": "'Delta', sans-serif",
      "--fontWeight-body-fontWeight": "600",
    };

    const preloads = buildCustomFontPreloads({
      themeConfig,
      themeValues,
      customFonts,
      customFontCssIndex,
    });

    expect(preloads).toEqual([]);
  });
});
