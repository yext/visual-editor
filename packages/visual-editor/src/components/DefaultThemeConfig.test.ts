import { describe, it, expect } from "vitest";
import { createDefaultThemeConfig } from "./DefaultThemeConfig.ts";
import { FontRegistry } from "../utils/fonts/visualEditorFonts.ts";

describe("createDefaultThemeConfig", () => {
  it("should include custom fonts in the font options", () => {
    const customFonts: FontRegistry = {
      "Custom Font": {
        italics: true,
        weights: [400, 700],
        fallback: "sans-serif",
      },
    };

    const result = createDefaultThemeConfig(customFonts);

    const h1FontOptions = (result.h1.styles.fontFamily as any).options;

    expect(h1FontOptions).toContainEqual({
      label: "Custom Font",
      value: "'Custom Font', 'Custom Font Fallback', sans-serif",
    });
  });

  it("should override default fonts with custom fonts if they have the same name", () => {
    const customFonts: FontRegistry = {
      "Open Sans": {
        italics: true,
        weights: [300, 400, 500],
        fallback: "serif",
      },
    };

    const result = createDefaultThemeConfig(customFonts);

    const h1FontOptions = (result.h1.styles.fontFamily as any).options;
    const openSansOption = h1FontOptions.find(
      (option: any) => option.label === "Open Sans"
    );
    expect(openSansOption).toBeDefined();
    expect(openSansOption?.value).toBe(
      "'Open Sans', 'Open Sans Fallback', serif"
    );
  });

  it("should merge custom fonts with default fonts", () => {
    const customFonts: FontRegistry = {
      "Custom Font": {
        italics: false,
        weights: [400],
        fallback: "serif",
      },
    };

    const result = createDefaultThemeConfig(customFonts);

    const h1FontOptions = (result.h1.styles.fontFamily as any).options;
    expect(h1FontOptions).toContainEqual({
      label: "Custom Font",
      value: "'Custom Font', 'Custom Font Fallback', serif",
    });

    expect(h1FontOptions).toContainEqual({
      label: "Open Sans",
      value: "'Open Sans', 'Open Sans Fallback', sans-serif",
    });
  });
});
