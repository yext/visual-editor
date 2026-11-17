import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import { migrateDynamicThemeSelections } from "../components/migrations/0084_dynamic_theme.ts";
import { describe, it, expect } from "vitest";
import {
  getContrastingColor,
  hexToRGB,
  luminanceFromRGB,
  isColorContrastWcagCompliant,
  convertComputedStyleColorToHex,
  getBackgroundColorClasses,
  getBackgroundColorStyle,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  getThemeColorHexValue,
  getTextColorClass,
  getTextColorStyle,
  isDarkColor,
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

describe("dynamic theme colors", () => {
  const theme = migrateThemeData({
    "--colors-palette-primary": "#341A1F",
    "--colors-palette-secondary": "#111418",
  });
  const document = { __: { theme: JSON.stringify(theme) } };
  it("uses channel-specific dynamic variables and keeps fallback in CSS", () => {
    const reference = { colorId: "ocean", channel: "foreground" as const };
    expect(getThemeColorCssValue(reference)).toBe(
      "var(--ve-colors-5-ocean-foreground, var(--ve-default-color-foreground))"
    );
    expect(getTextColorStyle(reference)?.color).toContain(
      "ocean-foreground-solid"
    );
    expect(getBackgroundColorClasses(reference)).toBe("");
    expect(getTextColorClass(reference)).toBeUndefined();
  });
  it("preserves both halves of custom colors including transparency", () => {
    expect(
      getBackgroundColorStyle({
        selectedColor: "[#FF6D6680]",
        contrastingColor: "[#123456]",
      })
    ).toEqual({ background: "#FF6D6680", color: "#123456" });
    expect(
      getTextColorStyle({
        selectedColor: "[#00E5FF]",
        contrastingColor: "black",
      })
    ).toEqual({ color: "#00E5FF" });
  });
  it("resolves concrete colors in a Node-compatible way after migration", () => {
    expect(
      getThemeColorHexValue(
        { colorId: "main-primary", channel: "background" },
        document
      )
    ).toBe("#341A1F");
    expect(
      getThemeColorHexValue(
        { colorId: "main-primary-light", channel: "background" },
        document
      )
    ).toBe("#FCF8F9");
    expect(
      getThemeColorHexValue(
        { colorId: "main-secondary-dark", channel: "background" },
        document
      )
    ).toBe("#2A323C");
    expect(
      isDarkColor({ colorId: "main-primary", channel: "background" }, document)
    ).toBe(true);
    expect(getThemeColorHexValue("hsl(0 100% 50%)")).toBe("#FF0000");
    expect(getThemeColorHexValue("rgb(0 128 255)")).toBe("#0080FF");
    expect(getThemeColorHexValue("#F008")).toBe("#FF0000");
    expect(getThemeColorHexValue("hsl(720 100% 50%)")).toBe("#FF0000");
    expect(getThemeColorHexValue("hsl(-120 100% 50%)")).toBe("#0000FF");
  });
  it("keeps the chosen channel and falls back for an unavailable identifier", () => {
    expect(
      getThemeColorHexValue(
        { colorId: "removed", channel: "foreground" },
        document
      )
    ).toBe("#000000");
    expect(
      getDefaultForegroundColor({ colorId: "ocean", channel: "background" })
    ).toEqual({ colorId: "ocean", channel: "foreground" });
  });
  it("preserves authored contrast overrides during layout conversion", () => {
    const converted = migrateDynamicThemeSelections({
      selectedColor: "palette-primary",
      contrastingColor: "[#123456]",
    });
    expect(converted).toMatchObject({
      colorId: "main-primary",
      contrastingColor: "[#123456]",
    });
    expect(getBackgroundColorStyle(converted)?.color).toBe("#123456");
  });
  it("does not resolve old palette tokens in the final runtime", () => {
    expect(getThemeColorCssValue("palette-primary")).toBeUndefined();
    expect(getThemeColorCssValue("palette-primary-light")).toBeUndefined();
    expect(getThemeColorCssValue("white")).toBe("white");
    expect(getThemeColorCssValue("[#00000099]")).toBe("#00000099");
    expect(getThemeColorCssValue(undefined)).toBeUndefined();
  });
  it("retains resolved values from field transforms", () => {
    expect(
      getBackgroundColorStyle({
        selectedColor: "[#123ABC]",
        contrastingColor: "[#FAEBCD]",
        selectedColorCss: "#112233",
        contrastingColorCss: "#445566",
      })
    ).toEqual({ background: "#112233", color: "#445566" });
  });
});
