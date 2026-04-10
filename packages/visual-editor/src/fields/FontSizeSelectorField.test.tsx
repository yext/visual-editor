import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TailwindConfigContext } from "../hooks/useTailwindConfig.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  convertDefaultFontSizesToOptions,
  convertToPixels,
  type FontSizeSelectorField,
  getCustomFontSize,
} from "./FontSizeSelectorField.tsx";

describe("convertToPixels", () => {
  beforeEach(() => {
    vi.stubGlobal("getComputedStyle", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should convert "16px" to 16', () => {
    const result = convertToPixels("16px");
    expect(result).toBe(16);
  });

  it('should convert "1rem" to pixels based on root font size', () => {
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "16px" });

    const result = convertToPixels("1rem");
    expect(result).toBe(16);
  });

  it('should convert "2rem" to pixels based on root font size', () => {
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "16px" });

    const result = convertToPixels("2rem");
    expect(result).toBe(32);
  });

  it('should convert "2em" to pixels based on parent font size', () => {
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "18px" });

    const result = convertToPixels("2em");
    expect(result).toBe(36);
  });

  it('should convert "150%" to pixels based on parent font size', () => {
    (getComputedStyle as any).mockReturnValueOnce({ fontSize: "20px" });

    const result = convertToPixels("150%");
    expect(result).toBe(30);
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
    const result = getCustomFontSize(mockTailwindConfig, "sm");
    expect(result).toBe(convertToPixels("10px"));
  });

  it("should convert font size from array (first value) to pixels", () => {
    const result = getCustomFontSize(mockTailwindConfig, "2xl");
    expect(result).toBe(convertToPixels("28px"));
  });

  it("should return 0 if no matching value is found", () => {
    const result = getCustomFontSize(mockTailwindConfig, "dne");
    expect(result).toBe(0);
  });
});

const fontSizes = [
  { label: "SM", value: "sm", px: "12" },
  { label: "Base", value: "base", px: "16" },
  { label: "LG", value: "lg", px: "24" },
  { label: "XL", value: "xl", px: "36" },
];

describe("convertDefaultFontSizesToOptions", () => {
  it("should use custom font size from tailwind config if available", () => {
    const result = convertDefaultFontSizesToOptions(
      fontSizes,
      mockTailwindConfig
    );

    expect(result).toEqual([
      { label: "SM (10px)", value: "sm" },
      { label: "Base (14px)", value: "base" },
      { label: "LG (20px)", value: "lg" },
      { label: "XL (36px)", value: "xl" },
    ]);
  });

  it("does not append a pixel suffix when the option has no default px", () => {
    const result = convertDefaultFontSizesToOptions(
      [{ label: "Default", value: "default", px: "" }],
      mockTailwindConfig
    );

    expect(result).toEqual([{ label: "Default", value: "default" }]);
  });
});

describe("FontSizeSelector", () => {
  const renderFontSizeField = (
    field: FontSizeSelectorField,
    value?: string
  ) => {
    const onChange = vi.fn();

    render(
      <TailwindConfigContext.Provider value={mockTailwindConfig}>
        <YextAutoField
          field={field}
          id="font-size"
          onChange={onChange}
          value={value}
        />
      </TailwindConfigContext.Provider>
    );

    return { onChange };
  };

  it("renders through YextAutoField as a registered field type", () => {
    const field: FontSizeSelectorField = {
      type: "fontSizeSelector",
      label: "Font Size",
    };
    const { onChange } = renderFontSizeField(field, "lg");

    expect(screen.getByText("LG (20px)")).toBeDefined();

    fireEvent.click(screen.getByText("LG (20px)"));
    fireEvent.click(screen.getByText("SM (10px)"));

    expect(onChange).toHaveBeenCalledWith("sm");
  });

  it("falls back to the default option when the value is not recognized", () => {
    const field: FontSizeSelectorField = {
      type: "fontSizeSelector",
      label: "Font Size",
    };

    renderFontSizeField(field, "does-not-exist");

    expect(screen.getByText("Default")).toBeDefined();
  });

  it("omits large sizes when includeLargeSizes is false", () => {
    const field: FontSizeSelectorField = {
      type: "fontSizeSelector",
      label: "Font Size",
      includeLargeSizes: false,
    };

    renderFontSizeField(field, "lg");

    fireEvent.click(screen.getByText("LG (20px)"));

    expect(screen.getByText("4XL (40px)")).toBeDefined();
    expect(screen.queryByText("5XL (48px)")).toBeNull();
  });
});
