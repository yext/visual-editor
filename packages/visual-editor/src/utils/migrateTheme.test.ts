import { describe, expect, it } from "vitest";
import { migrateTheme, THEME_VERSION_KEY } from "./migrateTheme.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { FontRegistry } from "./fonts/visualEditorFonts.ts";

const themeConfig: ThemeConfig = {
  body: {
    label: "Body",
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
};

describe("migrateTheme", () => {
  it("removes legacy custom font preloads and generates custom font assets", () => {
    const migratedTheme = migrateTheme(
      {
        "--fontFamily-body-fontFamily": "'Alpha', sans-serif",
        "--fontWeight-body-fontWeight": "700",
        "--fontStyle-body-fontStyle": "normal",
        __customFontPreloads: ["/y-fonts/alpha-regular.woff2"],
      },
      {
        themeConfig,
        customFonts,
      }
    );

    expect(migratedTheme).toEqual({
      "--fontFamily-body-fontFamily": "'Alpha', sans-serif",
      "--fontWeight-body-fontWeight": "700",
      "--fontStyle-body-fontStyle": "normal",
      __customFontAssets: {
        stylesheetPaths: ["y-fonts/alpha.css"],
        preloads: ["/y-fonts/alpha-bold.woff2"],
      },
      [THEME_VERSION_KEY]: 1,
    });
  });

  it("stamps the current theme version when no migration work is needed", () => {
    const migratedTheme = migrateTheme({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 1,
    });

    expect(migratedTheme).toEqual({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 1,
    });
  });

  it("does not lower a saved theme version that is newer than the current registry", () => {
    const migratedTheme = migrateTheme({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 99,
    });

    expect(migratedTheme).toEqual({
      "--fontFamily-body-fontFamily": "'Helvetica', sans-serif",
      [THEME_VERSION_KEY]: 99,
    });
  });
});
