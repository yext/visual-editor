import { describe, expect, it } from "vitest";
import {
  getPickerContrastHex,
  parsePickerGradient,
  serializePickerGradient,
} from "./colorPicker.ts";
import { pickerColorToHex } from "../fields/ColorSelector.tsx";
import {
  getBackgroundColorStyle,
  getSurfaceColorStyle,
  resolveBackgroundColor,
} from "./colors.ts";
import {
  backgroundColorZodSchema,
  siteColorZodSchema,
} from "./layoutGenerationSchemas/colorFieldSchemas.ts";
import type { ColorResult } from "react-color";

const gradient = "linear-gradient(45deg, #00000080 0%, #FFFFFF 100%)";

describe("picker color persistence", () => {
  it("round trips linear and radial gradients and rejects invalid values", () => {
    for (const value of [
      gradient,
      "radial-gradient(circle, #123456 0%, #ABCDEF00 100%)",
    ]) {
      expect(serializePickerGradient(parsePickerGradient(value)!)).toBe(value);
    }
    for (const value of [
      "#123456",
      "linear-gradient(361deg, #000000 0%, #FFFFFF 100%)",
      "url(https://example.com)",
    ]) {
      expect(parsePickerGradient(value)).toBeUndefined();
    }
  });

  it("preserves zero, partial and full opacity", () => {
    for (const [a, expected] of [
      [0, "#12345600"],
      [0.5, "#12345680"],
      [1, "#123456"],
    ] as const) {
      expect(
        pickerColorToHex({ hex: "#123456", rgb: { a } } as ColorResult)
      ).toBe(expected);
    }
    expect(getPickerContrastHex("#00000000")).toBe("#ffffff");
    expect(getPickerContrastHex(gradient)).toBe("#7f7f7f");
  });

  it("renders gradients as background images and accepts them only for background fields", () => {
    const color = {
      selectedColor: `[${gradient}]`,
      contrastingColor: "black",
      isDarkColor: false,
    };
    expect(getBackgroundColorStyle(color)).toEqual({
      backgroundImage: gradient,
      color: "black",
    });
    expect(getSurfaceColorStyle(color)).toEqual({
      backgroundImage: gradient,
      color: "black",
    });
    expect(backgroundColorZodSchema.safeParse(color).success).toBe(true);
    expect(siteColorZodSchema.safeParse(color).success).toBe(false);
    expect(
      siteColorZodSchema.safeParse({ ...color, selectedColor: "[#12345680]" })
        .success
    ).toBe(true);
  });
});

describe("background normalization", () => {
  it.each([
    ["[#000000]", true],
    ["black", true],
    ["white", false],
    ["[rgb(0, 0, 0)]", true],
    ["[#00000000]", false],
    ["[linear-gradient(90deg, #000000 0%, #ffffff 100%)]", true],
    ["palette-primary-dark", true],
    ["palette-primary-light", false],
  ])("normalizes raw and transformed %s identically", (selectedColor, dark) => {
    const raw = { selectedColor, contrastingColor: "white" };
    const resolved = resolveBackgroundColor(raw, "background");
    expect(
      resolveBackgroundColor(
        {
          ...raw,
          // Derived fields must never override the authored token.
          selectedColorCss: "#ff0000",
          contrastingColorCss: "#0000ff",
        },
        "background"
      )
    ).toEqual(resolved);
    expect(resolved.context.isDarkColor).toBe(dark);
  });
});
