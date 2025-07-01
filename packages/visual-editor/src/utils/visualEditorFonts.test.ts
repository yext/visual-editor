import { describe, it, expect, vi } from "vitest";
import { ThemeData } from "../internal/types/themeData.ts";
import {
  extractInUseFontFamilies,
  FontRegistry,
  defaultFonts,
  constructGoogleFontLinkTags,
} from "./visualEditorFonts.ts";

describe("extractInUseFontFamilies", () => {
  it("should return the specifications for all fonts used in the theme", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Oi', sans-serif",
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };

    const expected: FontRegistry = {
      Oi: { italics: false, weights: [400], fallback: "sans-serif" },
      Adamina: { italics: false, weights: [400], fallback: "serif" },
    };

    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual(expected);
  });

  it("should return an empty object if theme data is empty", () => {
    const themeData: ThemeData = {};
    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual({});
  });

  it("should return an empty object if no font families are defined in the theme", () => {
    const themeData: ThemeData = {
      "--colors-palette-primary": "#CF0A2C",
      "--fontSize-h1-fontSize": "48px",
    };
    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual({});
  });

  it("should return an empty object if the list of available fonts is empty", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
    };
    const emptyAvailableFonts = {};
    expect(extractInUseFontFamilies(themeData, emptyAvailableFonts)).toEqual(
      {}
    );
  });

  it("should handle malformed or empty fontFamily values gracefully", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "",
      "--fontFamily-h2-fontFamily": null,
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };
    const expected: FontRegistry = {
      Adamina: { italics: false, weights: [400], fallback: "serif" },
    };
    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual(expected);
  });

  it("should not include duplicate fonts, even if used multiple times", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-h2-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-body-fontFamily": "'Open Sans', sans-serif",
    };

    const expected: FontRegistry = {
      "Open Sans": {
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    };

    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual(expected);
  });

  it("should handle fontFamily in theme data not in available fonts", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Fake Font', sans-serif",
    };
    expect(extractInUseFontFamilies(themeData, defaultFonts)).toEqual({});
    expect(consoleSpy).toHaveBeenLastCalledWith(
      "The font 'Fake Font' is used in the theme but cannot be found in available fonts."
    );
  });
});

describe("constructGoogleFontLinkTags", () => {
  const preconnectTags =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n';

  it("should return an empty string if the font registry is empty", () => {
    const fonts: FontRegistry = {};
    expect(constructGoogleFontLinkTags(fonts)).toBe("");
  });

  it("should create a correct link for a single static font without italics", () => {
    const fonts: FontRegistry = {
      Roboto: { weights: [400, 700], italics: false, fallback: "sans-serif" },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single static font with italics", () => {
    const fonts: FontRegistry = {
      Lato: { weights: [400, 900], italics: true, fallback: "sans-serif" },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,900;1,400;1,900&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single variable font without italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
        minWeight: 300,
        maxWeight: 800,
        italics: false,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single variable font with italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
        minWeight: 300,
        maxWeight: 800,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should handle variable fonts where min and max weight are the same", () => {
    const fonts: FontRegistry = {
      "Single Weight Var": {
        minWeight: 500,
        maxWeight: 500,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Single+Weight+Var:ital,wght@0,500;1,500&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should combine multiple fonts into a single link tag", () => {
    const fonts: FontRegistry = {
      Roboto: { weights: [400], italics: false, fallback: "sans-serif" },
      Lato: {
        minWeight: 300,
        maxWeight: 700,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&family=Lato:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create multiple link tags when the number of fonts exceeds the chunk size", () => {
    const fonts: FontRegistry = {
      Font1: { weights: [400], italics: false, fallback: "sans-serif" },
      Font2: { weights: [400], italics: false, fallback: "sans-serif" },
      Font3: { weights: [400], italics: false, fallback: "sans-serif" },
      Font4: { weights: [400], italics: false, fallback: "sans-serif" },
      Font5: { weights: [400], italics: false, fallback: "sans-serif" },
      Font6: { weights: [400], italics: false, fallback: "sans-serif" },
      Font7: { weights: [400], italics: false, fallback: "sans-serif" },
      Font8: { weights: [400], italics: false, fallback: "sans-serif" },
    };

    const link1Params =
      "family=Font1:wght@400&family=Font2:wght@400&family=Font3:wght@400&family=Font4:wght@400&family=Font5:wght@400&family=Font6:wght@400&family=Font7:wght@400";
    const link2Params = "family=Font8:wght@400";

    const link1 = `<link href="https://fonts.googleapis.com/css2?${link1Params}&display=swap" rel="stylesheet">`;
    const link2 = `<link href="https://fonts.googleapis.com/css2?${link2Params}&display=swap" rel="stylesheet">`;

    const expected = `${preconnectTags}${link1}\n${link2}`;
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });
});
