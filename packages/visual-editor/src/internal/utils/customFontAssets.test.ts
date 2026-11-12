import { describe, it, expect } from "vitest";
import {
  buildCustomFontAssets,
  buildFontPreloadTags,
  updateThemeWithCustomFontAssets,
} from "./customFontAssets.ts";
import { type ThemeFields } from "../theme/themeFields.ts";
import { resolveThemeFonts } from "../../utils/fonts/visualEditorFonts.ts";
import { type FontRegistry } from "../../utils/fonts/visualEditorFonts.ts";
const fields: ThemeFields = {
  family: {
    label: "Family",
    type: "fontFamily",
    default: "'Open Sans', sans-serif",
    variable: "--arbitrary-family",
  },
  weight: {
    label: "Weight",
    type: "fontWeight",
    default: "700",
    variable: "--arbitrary-weight",
    fontFamilyKey: "family",
  },
  style: {
    label: "Style",
    type: "fontStyle",
    default: "normal",
    variable: "--arbitrary-style",
    fontFamilyKey: "family",
  },
};
const customFonts: FontRegistry = {
  Alpha: {
    italics: true,
    weights: [400, 700],
    fallback: "sans-serif",
    facePath: "y-fonts/alpha.css",
    variants: [
      {
        style: "normal",
        weights: [700],
        filePath: "/y-fonts/alpha-bold.woff2",
      },
      {
        style: "italic",
        minWeight: 300,
        maxWeight: 900,
        filePath: "/y-fonts/alpha-italic.woff2",
      },
    ],
  },
};
describe("fixed-field fonts", () => {
  it("resolves assets through explicit keys independent of variable names", () => {
    expect(
      buildCustomFontAssets({
        fields,
        customFonts,
        themeValues: {
          family: "'Alpha', sans-serif",
          weight: "700",
          style: "normal",
        },
      })
    ).toEqual({
      stylesheetPaths: ["y-fonts/alpha.css"],
      preloads: ["/y-fonts/alpha-bold.woff2"],
    });
    expect(
      buildCustomFontAssets({
        fields,
        customFonts,
        themeValues: {
          family: "'Alpha', sans-serif",
          weight: "500",
          style: "italic",
        },
      }).preloads
    ).toEqual(["/y-fonts/alpha-italic.woff2"]);
  });
  it("uses defaults for missing font properties and ignores old variables", () => {
    expect(
      buildCustomFontAssets({
        fields,
        customFonts,
        themeValues: { "--fontFamily-body-fontFamily": "'Alpha', sans-serif" },
      })
    ).toEqual({ stylesheetPaths: [], preloads: [] });
    expect(
      buildCustomFontAssets({
        fields,
        customFonts,
        themeValues: { family: "'Alpha', sans-serif" },
      }).preloads
    ).toEqual(["/y-fonts/alpha-bold.woff2"]);
  });
  it("loads default font families and their custom assets without saved values", () => {
    const defaultFields: ThemeFields = Object.fromEntries(
      Object.entries(fields).map(([fieldKey, field]) => [
        fieldKey,
        field.type === "fontFamily"
          ? { ...field, default: "'Alpha', sans-serif" }
          : field,
      ])
    );
    expect(
      resolveThemeFonts({}, customFonts, defaultFields).customFonts
    ).toEqual(customFonts);
    expect(
      buildCustomFontAssets({
        fields: defaultFields,
        customFonts,
        themeValues: {},
      })
    ).toEqual({
      stylesheetPaths: ["y-fonts/alpha.css"],
      preloads: ["/y-fonts/alpha-bold.woff2"],
    });
  });
  it("loads selected custom and Google fonts plus the legacy default font", () => {
    expect(
      resolveThemeFonts({ family: "'Alpha', sans-serif" }, customFonts, fields)
        .customFonts
    ).toEqual(customFonts);
    expect(
      resolveThemeFonts({ family: "'Roboto', sans-serif" }, {}, fields)
        .googleFonts
    ).toHaveProperty("Roboto");
    expect(resolveThemeFonts({}, {}, fields).googleFonts).toHaveProperty(
      "Open Sans"
    );
  });
  it("removes stale asset metadata when the resolved font needs no custom assets", () => {
    expect(
      updateThemeWithCustomFontAssets({
        fields,
        customFonts,
        themeValues: {
          __customFontAssets: { stylesheetPaths: ["old.css"], preloads: [] },
        },
      })
    ).not.toHaveProperty("__customFontAssets");
  });
});
describe("buildFontPreloadTags", () => {
  it("derives the preload type from the file extension", () => {
    expect(buildFontPreloadTags(["/y-fonts/alpha-regular.woff"], "./")).toEqual(
      '<link rel="preload" href="/y-fonts/alpha-regular.woff" as="font" type="font/woff" crossorigin="anonymous">\n'
    );
  });

  it("omits the preload type when the extension is unknown", () => {
    expect(buildFontPreloadTags(["/y-fonts/alpha-regular.bin"], "./")).toEqual(
      '<link rel="preload" href="/y-fonts/alpha-regular.bin" as="font" crossorigin="anonymous">\n'
    );
  });
});
