import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  convertToPixels,
  getCustomFontSize,
  convertDefaultFontSizesToOptions,
} from "./FontSizeSelector.tsx";

describe("convertToPixels", () => {
  beforeEach(() => {
    // Mock the getComputedStyle function to control the return values
    vi.stubGlobal("getComputedStyle", vi.fn());
  });

  it('should convert "16px" to 16', () => {
    const result = convertToPixels("16px");
    expect(result).toBe(16);
  });

  it('should convert "1rem" to pixels based on root font size', () => {
    // Mock getComputedStyle for root font size (document.documentElement)
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "16px" });

    const result = convertToPixels("1rem");
    expect(result).toBe(16); // 1rem = 16px based on our mock
  });

  it('should convert "2rem" to pixels based on root font size', () => {
    // Mock getComputedStyle for root font size (document.documentElement)
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "16px" });

    const result = convertToPixels("2rem");
    expect(result).toBe(32); // 2rem = 32px based on our mock
  });

  it('should convert "2em" to pixels based on parent font size', () => {
    // Mock getComputedStyle for parent font size (document.body)
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "18px" });

    const result = convertToPixels("2em");
    expect(result).toBe(36); // 2em = 36px based on our mock
  });

  it('should convert "150%" to pixels based on parent font size', () => {
    // Mock getComputedStyle for parent font size (document.body)
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "20px" });

    const result = convertToPixels("150%");
    expect(result).toBe(30); // 150% of 20px = 30px
  });

  it("should throw an error for unknown units", () => {
    expect(() => convertToPixels("10pt")).toThrowError(
      "Unknown font size unit"
    );
  });

  it("should throw an error when no unit is provided", () => {
    expect(() => convertToPixels("100")).toThrowError("Unknown font size unit");
  });
});

const mockTailwindConfig = {
  theme: {
    extend: {
      fontSize: {
        sm: "10px",
        base: "14px",
        lg: ["20px", "24px"],
        "2xl": ["28px", ["36px", "40px"]],
      },
    },
  },
};

describe("getCustomFontSize", () => {
  it("should convert font size from string to pixels", () => {
    // Manually testing `convertToPixels` for the value '12px'
    const result = getCustomFontSize(mockTailwindConfig, "sm");
    expect(result).toBe(convertToPixels("10px")); // The return value from convertToPixels should be returned
  });

  it("should convert font size from array (first value) to pixels", () => {
    const result = getCustomFontSize(mockTailwindConfig, "2xl");
    expect(result).toBe(convertToPixels("28px")); // convertToPixels should be called with the first element of the array
  });

  it("should return 0 if no matching value is found", () => {
    const result = getCustomFontSize(mockTailwindConfig, "dne");
    expect(result).toBe(0); // No font size found in config, should return 0
  });
});

const fontSizes = [
  { label: "SM", value: "sm", px: "12" },
  { label: "Base", value: "base", px: "16" },
  { label: "LG", value: "lg", px: "24" },
  { label: "XL", value: "xl", px: "36" }, // This will not match any config value
];

describe("convertDefaultFontSizesToOptions", () => {
  it("should use custom font size from tailwind config if available", () => {
    // Test case where the custom font size is found in the config
    const result = convertDefaultFontSizesToOptions(
      fontSizes,
      mockTailwindConfig
    );
    expect(result).toEqual([
      { label: "SM (10px)", value: "sm" }, // 10px from config, not the default 12px
      { label: "Base (14px)", value: "base" }, // 14px from config
      { label: "LG (20px)", value: "lg" }, // 20px from config
      { label: "XL (36px)", value: "xl" }, // 36px is the default value since no custom font size found in config
    ]);
  });
});
