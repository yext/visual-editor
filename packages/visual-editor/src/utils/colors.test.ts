import { describe, it, expect } from "vitest";
import {
  getContrastingColor,
  hexToRGB,
  hexToHSL,
  luminanceFromRGB,
  isColorContrastWcagCompliant,
  srgbToHSL,
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

describe("hexToHSL", () => {
  it("should correctly calculate HSL", () => {
    expect(hexToHSL("#000000")).toStrictEqual([0, 0, 0]);
    expect(hexToHSL("#FFF")).toStrictEqual([0, 0, 100]);
    expect(hexToHSL("#11544d")).toStrictEqual([174, 66.3, 19.8]);
    expect(hexToHSL("#777")).toStrictEqual([0, 0, 46.7]);
  });

  it("should return undefined if hex argument is invalid", () => {
    expect(hexToHSL("123456")).toBeUndefined();
    expect(hexToHSL("#123456789")).toBeUndefined();
    expect(hexToHSL("#16")).toBeUndefined();
  });
});

describe("srgbToHSL", () => {
  it("should correctly calculate RGB", () => {
    expect(srgbToHSL([0, 0, 0])).toStrictEqual([0, 0, 0]);
    expect(srgbToHSL([1, 1, 1])).toStrictEqual([0, 0, 100]);
    expect(srgbToHSL([0.23, 0.5, 0.1])).toStrictEqual([100.5, 66.6, 30]);
    expect(srgbToHSL([0.88, 0.1, 0.9])).toStrictEqual([298.5, 80, 50]);
  });

  it("should return undefined if hex argument is invalid", () => {
    expect(srgbToHSL([])).toBeUndefined();
    expect(srgbToHSL([1, 2, 3, 4])).toBeUndefined();
    expect(srgbToHSL([2000, 0.4, 0.2])).toBeUndefined();
    expect(srgbToHSL([0.2, -0.4, 0.2])).toBeUndefined();
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
