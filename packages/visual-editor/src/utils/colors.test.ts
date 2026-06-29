import { describe, it, expect } from "vitest";
import {
  getContrastingColor,
  getDefaultForegroundColor,
  hexToRGB,
  luminanceFromRGB,
  isColorContrastWcagCompliant,
  convertComputedStyleColorToHex,
  getBackgroundColorClasses,
  getBackgroundColorStyle,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  getThemeColorHexValue,
  getTextColorClass,
  getTextColorStyle,
  isCustomThemeColorToken,
  isDarkColor,
  normalizeThemeColorToken,
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

describe("getBackgroundColorClasses", () => {
  it("returns background and contrasting classes from stored tokens", () => {
    expect(
      getBackgroundColorClasses({
        selectedColor: "palette-primary-light",
        contrastingColor: "black",
      })
    ).toBe("bg-palette-primary-light text-black");
  });

  it("returns an empty string when color is undefined", () => {
    expect(getBackgroundColorClasses(undefined)).toBe("");
  });

  it("omits custom selected color tokens from class output", () => {
    expect(
      getBackgroundColorClasses({
        selectedColor: "[#FF6D66]",
        contrastingColor: "black",
      })
    ).toBe("text-black");
  });
});

describe("getBackgroundColorStyle", () => {
  it("returns inline styles for custom selected color tokens", () => {
    expect(
      getBackgroundColorStyle({
        selectedColor: "[#FF6D66]",
        contrastingColor: "black",
      })
    ).toStrictEqual({ backgroundColor: "#FF6D66" });
  });

  it("returns undefined for theme colors", () => {
    expect(
      getBackgroundColorStyle({
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      })
    ).toBeUndefined();
  });
});

describe("getTextColorClass", () => {
  it("returns text class from selected color token", () => {
    expect(
      getTextColorClass({
        selectedColor: "palette-primary",
        contrastingColor: "white",
      })
    ).toBe("text-palette-primary");
  });

  it("returns undefined when color is undefined", () => {
    expect(getTextColorClass(undefined)).toBeUndefined();
  });

  it("returns undefined for custom selected color tokens", () => {
    expect(
      getTextColorClass({
        selectedColor: "[#00E5FF]",
        contrastingColor: "black",
      })
    ).toBeUndefined();
  });
});

describe("getTextColorStyle", () => {
  it("returns inline styles for custom selected color tokens", () => {
    expect(
      getTextColorStyle({
        selectedColor: "[#00E5FF]",
        contrastingColor: "black",
      })
    ).toStrictEqual({ color: "#00E5FF" });
  });

  it("returns undefined for theme colors", () => {
    expect(
      getTextColorStyle({
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      })
    ).toBeUndefined();
  });
});

describe("isCustomThemeColorToken", () => {
  it("identifies bracketed custom color tokens", () => {
    expect(isCustomThemeColorToken("[#FF6D66]")).toBe(true);
    expect(isCustomThemeColorToken("palette-primary")).toBe(false);
    expect(isCustomThemeColorToken(undefined)).toBe(false);
  });
});

describe("getThemeColorCssValue", () => {
  it("returns direct css variables for base palette tokens", () => {
    expect(getThemeColorCssValue("palette-primary")).toBe(
      "var(--colors-palette-primary)"
    );
    expect(getThemeColorCssValue("palette-quaternary-contrast")).toBe(
      "var(--colors-palette-quaternary-contrast)"
    );
  });

  it("resolves derived light/dark palette tokens", () => {
    expect(getThemeColorCssValue("palette-primary-light")).toBe(
      "hsl(from var(--colors-palette-primary) h s 98)"
    );
    expect(getThemeColorCssValue("palette-secondary-dark")).toBe(
      "hsl(from var(--colors-palette-secondary) h s 20)"
    );
  });

  it("supports white/black and bracketed custom values", () => {
    expect(getThemeColorCssValue("white")).toBe("white");
    expect(getThemeColorCssValue("black")).toBe("black");
    expect(getThemeColorCssValue("[#00000099]")).toBe("#00000099");
  });

  it("returns undefined for empty values", () => {
    expect(getThemeColorCssValue(undefined)).toBeUndefined();
  });

  it("accepts ThemeColor values directly", () => {
    expect(
      getThemeColorCssValue({
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      })
    ).toBe("var(--colors-palette-primary)");
  });
});

describe("getThemeColorHexValue", () => {
  const streamDocument = {
    __: {
      theme: JSON.stringify({
        "--colors-palette-primary": "#341A1F",
        "--colors-palette-secondary": "#111418",
        "--colors-palette-quaternary-contrast": "#F5F5F5",
      }),
    },
  };

  it("supports literal and bracketed colors", () => {
    expect(getThemeColorHexValue("white", streamDocument)).toBe("#FFFFFF");
    expect(getThemeColorHexValue("black", streamDocument)).toBe("#000000");
    expect(getThemeColorHexValue("[#ff6d66]", streamDocument)).toBe("#FF6D66");
    expect(getThemeColorHexValue("[#00000099]", streamDocument)).toBe(
      "#000000"
    );
  });

  it("resolves base palette tokens from the published theme", () => {
    expect(getThemeColorHexValue("palette-primary", streamDocument)).toBe(
      "#341A1F"
    );
    expect(
      getThemeColorHexValue("palette-quaternary-contrast", streamDocument)
    ).toBe("#F5F5F5");
  });

  it("derives light and dark palette tokens from the published theme", () => {
    expect(getThemeColorHexValue("palette-primary-light", streamDocument)).toBe(
      "#FCF8F9"
    );
    expect(
      getThemeColorHexValue("palette-secondary-dark", streamDocument)
    ).toBe("#2A323C");
  });

  it("returns undefined when theme values are unavailable", () => {
    expect(
      getThemeColorHexValue("palette-primary", { __: { theme: "{}" } })
    ).toBeUndefined();
  });

  it("accepts ThemeColor values directly", () => {
    expect(
      getThemeColorHexValue(
        {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        streamDocument
      )
    ).toBe("#341A1F");
  });
});

describe("normalizeThemeColorToken", () => {
  it("treats default as unset", () => {
    expect(normalizeThemeColorToken("default")).toBeUndefined();
    expect(
      normalizeThemeColorToken({
        selectedColor: "default",
        contrastingColor: "black",
      })
    ).toBeUndefined();
  });
});

describe("getDefaultForegroundColor", () => {
  const streamDocument = {
    __: {
      theme: JSON.stringify({
        "--colors-palette-primary": "#111111",
        "--colors-palette-secondary": "#F5F5F5",
        "--colors-palette-tertiary": "#888888",
      }),
    },
  };

  it("returns white for dark surfaces", () => {
    expect(
      getDefaultForegroundColor(
        {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        streamDocument
      )
    ).toStrictEqual({
      selectedColor: "white",
      contrastingColor: "black",
    });
  });

  it("returns palette-primary-dark for light surfaces", () => {
    expect(
      getDefaultForegroundColor(
        {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        streamDocument
      )
    ).toStrictEqual({
      selectedColor: "palette-primary-dark",
      contrastingColor: "white",
    });
  });

  it("uses the same contrast decision for mid-tone surfaces", () => {
    expect(
      getDefaultForegroundColor(
        {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        streamDocument
      )
    ).toStrictEqual({
      selectedColor: "palette-primary-dark",
      contrastingColor: "white",
    });
  });
});

describe("getSurfaceColorStyle", () => {
  it("returns inline surface styles with a dynamic default foreground", () => {
    expect(
      getSurfaceColorStyle({
        selectedColor: "[#F5F5F5]",
        contrastingColor: "black",
      })
    ).toStrictEqual({
      backgroundColor: "#F5F5F5",
      color: "hsl(from var(--colors-palette-primary) h s 20)",
    });
  });

  it("returns undefined when the surface color is unset", () => {
    expect(getSurfaceColorStyle(undefined)).toBeUndefined();
  });
});

describe("isDarkColor", () => {
  const streamDocument = {
    __: {
      theme: JSON.stringify({
        "--colors-palette-primary": "#111111",
        "--colors-palette-secondary": "#EEEEEE",
        "--colors-palette-primary-contrast": "#FFFFFF",
        "--colors-palette-secondary-contrast": "#000000",
      }),
    },
  };

  it("returns true or false for built-in contrast colors", () => {
    expect(
      isDarkColor({
        selectedColor: "palette-primary",
        contrastingColor: "white",
      })
    ).toBe(true);
    expect(
      isDarkColor({
        selectedColor: "palette-primary",
        contrastingColor: "black",
      })
    ).toBe(false);
  });

  it("accepts string tokens and treats default as unset", () => {
    expect(isDarkColor("default")).toBe(false);
    expect(isDarkColor("palette-primary", streamDocument)).toBe(true);
    expect(isDarkColor("palette-secondary", streamDocument)).toBe(false);
  });

  it("uses the published theme when available", () => {
    expect(
      isDarkColor(
        {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        streamDocument
      )
    ).toBe(true);
    expect(
      isDarkColor(
        {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        streamDocument
      )
    ).toBe(false);
  });

  it("falls back to the legacy palette defaults when the theme has no contrast value", () => {
    const emptyThemeDocument = {
      __: {
        theme: "{}",
      },
    };

    expect(
      isDarkColor(
        {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        emptyThemeDocument
      )
    ).toBe(true);
    expect(
      isDarkColor(
        {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        emptyThemeDocument
      )
    ).toBe(true);
    expect(
      isDarkColor(
        {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        emptyThemeDocument
      )
    ).toBe(false);
    expect(
      isDarkColor(
        {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
        emptyThemeDocument
      )
    ).toBe(true);
  });

  it("uses the browser-resolved css color when available", () => {
    expect(
      isDarkColor({
        selectedColor: "[#0d2140]",
        contrastingColor: "[#ffffff]",
      })
    ).toBe(true);
    expect(
      isDarkColor({
        selectedColor: "[#f5f5f5]",
        contrastingColor: "[#000000]",
      })
    ).toBe(false);
  });

  it("preserves explicit dark metadata on ThemeColor objects", () => {
    expect(
      isDarkColor({
        selectedColor: "default",
        contrastingColor: "black",
        isDarkColor: true,
      })
    ).toBe(true);
  });

  it("fails safe for null input", () => {
    expect(isDarkColor(null as any)).toBe(false);
  });

  it("fails safe when the color cannot be resolved", () => {
    expect(
      isDarkColor({
        selectedColor: "palette-missing",
        contrastingColor: "palette-missing-contrast",
      })
    ).toBe(false);
  });
});
