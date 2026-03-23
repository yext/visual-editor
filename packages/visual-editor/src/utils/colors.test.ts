import { describe, it, expect } from "vitest";
import {
  getContrastingColor,
  hexToRGB,
  luminanceFromRGB,
  isColorContrastWcagCompliant,
  convertComputedStyleColorToHex,
  normalizeThemeColor,
  resolveCssVarFromThemeColor,
  getInlineStyleForTextColor,
} from "./colors.ts";

describe("getContrastingColor", () => {
  it("should return black given a light color", () => {
    expect(getContrastingColor("#bad5ff", 12, 400)).toBe("#000000");
  });
  it("should return white given a dark color", () => {
    expect(getContrastingColor("#0d2140", 12, 400)).toBe("#FFFFFF");
  });
  it("should return black given an invalid color", () => {
    expect(getContrastingColor("###0d2140", 12, 400)).toBe("#000000");
  });
});

describe("getLuminanceFromRgb", () => {
  it("should correctly calculate luminance", () => {
    expect(luminanceFromRGB([255, 255, 255])).toBe(1);
    expect(luminanceFromRGB([0, 0, 0])).toBe(0);
    expect(luminanceFromRGB([192, 62, 62])).toBe(0.14999517012130859);
    expect(luminanceFromRGB([52, 69, 67])).toBe(0.05391555744327111);
  });

  it("should return undefined if rgb argument is invalid", () => {
    expect(luminanceFromRGB([0])).toBeUndefined();
    expect(luminanceFromRGB([0, 1, 3, 4, 5])).toBeUndefined();
    expect(luminanceFromRGB([-2, 4, 5])).toBeUndefined();
    expect(luminanceFromRGB([2555, 2, 2])).toBeUndefined();
  });
});

describe("hexToRGB", () => {
  it("should correctly calculate RGB", () => {
    expect(hexToRGB("#000000")).toStrictEqual([0, 0, 0]);
    expect(hexToRGB("#FFF")).toStrictEqual([255, 255, 255]);
    expect(hexToRGB("#11544d")).toStrictEqual([17, 84, 77]);
    expect(hexToRGB("#777")).toStrictEqual([119, 119, 119]);
  });

  it("should return undefined if hex argument is invalid", () => {
    expect(hexToRGB("123456")).toBeUndefined();
    expect(hexToRGB("#123456789")).toBeUndefined();
    expect(hexToRGB("#16")).toBeUndefined();
  });
});

describe("convertComputedStyleColorToHex", () => {
  it("should correctly read rgb values", () => {
    expect(convertComputedStyleColorToHex("rgb(255, 0, 0)")).toBe("#FF0000");
    expect(convertComputedStyleColorToHex("rgb(0, 255, 0)")).toBe("#00FF00");
    expect(convertComputedStyleColorToHex("rgb(0, 0, 255)")).toBe("#0000FF");
  });

  it("should correctly read rgba values", () => {
    expect(convertComputedStyleColorToHex("rgba(255, 0, 0, 1)")).toBe(
      "#FF0000"
    );
    expect(convertComputedStyleColorToHex("rgba(0, 255, 0, 1)")).toBe(
      "#00FF00"
    );
    expect(convertComputedStyleColorToHex("rgba(0, 0, 255, 1)")).toBe(
      "#0000FF"
    );
  });

  it("should correctly read color(srgb ...) values", () => {
    expect(convertComputedStyleColorToHex("color(srgb 1 0 0)")).toBe("#FF0000");
    expect(convertComputedStyleColorToHex("color(srgb 0 1 0)")).toBe("#00FF00");
    expect(convertComputedStyleColorToHex("color(srgb 0 0 1)")).toBe("#0000FF");
  });

  it("should return an empty string for invalid inputs", () => {
    expect(convertComputedStyleColorToHex("invalid")).toBe("");
    expect(convertComputedStyleColorToHex("")).toBe("");
    expect(convertComputedStyleColorToHex("rgb(256, 0, 0)")).toBe("");
  });

  it("should return an empty string for transparent values", () => {
    expect(convertComputedStyleColorToHex("rgba(0, 0, 255, 0.5)")).toBe("");
  });
});

describe("isColorContrastWcagCompliant", () => {
  it("should return false for values that always fail", () => {
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [182, 47, 47], 12, 400)
    ).toBe(false);
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [182, 47, 47], 12, 900)
    ).toBe(false);
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [182, 47, 47], 20, 400)
    ).toBe(false);
  });

  it("should return true for values that always pass", () => {
    expect(
      isColorContrastWcagCompliant([0, 0, 0], [255, 255, 255], 12, 400)
    ).toBe(true);
    expect(
      isColorContrastWcagCompliant([0, 0, 0], [255, 255, 255], 12, 900)
    ).toBe(true);
    expect(
      isColorContrastWcagCompliant([0, 0, 0], [255, 255, 255], 20, 400)
    ).toBe(true);
  });

  it("should return true or false for values that depend on font size and weight", () => {
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [229, 154, 154], 12, 400)
    ).toBe(false);
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [229, 154, 154], 12, 900)
    ).toBe(false);
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [229, 154, 154], 14, 900)
    ).toBe(true);
    expect(
      isColorContrastWcagCompliant([67, 67, 112], [229, 154, 154], 20, 400)
    ).toBe(true);
  });

  it("should return false for invalid values", () => {
    expect(
      isColorContrastWcagCompliant([10000, 67, 112], [229, 154, 154], 12, 400)
    ).toBe(false);
    expect(isColorContrastWcagCompliant([], [], 12, 400)).toBe(false);
  });
});

describe("normalizeThemeColor", () => {
  it("returns undefined when token is undefined", () => {
    expect(normalizeThemeColor(undefined)).toBeUndefined();
  });

  it("returns undefined when token is empty string", () => {
    expect(normalizeThemeColor("")).toBeUndefined();
  });

  it("strips bg- prefix", () => {
    expect(normalizeThemeColor("bg-palette-primary-dark")).toBe(
      "palette-primary-dark"
    );
  });

  it("strips text- prefix", () => {
    expect(normalizeThemeColor("text-white")).toBe("white");
  });

  it("returns undefined for unsupported prefixes", () => {
    expect(normalizeThemeColor("border-red-500")).toBeUndefined();
  });

  it("returns undefined when prefix exists but value is empty", () => {
    expect(normalizeThemeColor("bg-")).toBeUndefined();
    expect(normalizeThemeColor("text-")).toBeUndefined();
  });
});

describe("resolveCssVarFromThemeColor", () => {
  it("returns a theme css var when token is valid", () => {
    expect(resolveCssVarFromThemeColor("bg-palette-primary-dark")).toBe(
      "var(--colors-palette-primary-dark)"
    );
  });

  it("returns undefined when token is invalid", () => {
    expect(resolveCssVarFromThemeColor("border-red-500")).toBeUndefined();
  });
});

describe("getInlineStyleForTextColor", () => {
  it("returns a style object when bgColor is valid", () => {
    expect(
      getInlineStyleForTextColor({
        bgColor: "bg-white",
        textColor: "text-black",
      })
    ).toEqual({ color: "var(--colors-white)" });
  });

  it("returns undefined when bgColor is missing", () => {
    expect(getInlineStyleForTextColor(undefined)).toBeUndefined();
  });
});
