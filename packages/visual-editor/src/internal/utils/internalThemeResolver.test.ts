import { describe, it, expect } from "vitest";
import { readThemeValues, themeValuesToCss } from "./internalThemeResolver.ts";
import {
  flattenThemeFields,
  themeCategories,
  themeFields,
  type ThemeCategory,
  type ThemeFields,
} from "../theme/themeFields.ts";
const fields: ThemeFields = {
  size: {
    label: "Size",
    type: "number",
    variable: "--size",
    default: 12,
  },
  color: {
    label: "Color",
    type: "color",
    variable: "--color",
    default: "#000000",
  },
};
describe("theme values", () => {
  it("round trips key-based values including zero", () => {
    const values = JSON.parse(JSON.stringify({ size: 0, color: "red" }));
    expect(readThemeValues(values, fields)).toEqual(values);
    expect(themeValuesToCss(values, fields)).toEqual({
      "--size": "0px",
      "--color": "red",
    });
  });
  it("falls back to field defaults for missing or invalid saved values and ignores old variables", () => {
    expect(
      themeValuesToCss(
        { size: NaN, color: "", "--color": "red", unknown: "blue" },
        fields
      )
    ).toEqual({ "--size": "12px", "--color": "#000000" });
    expect(readThemeValues({}, fields)).toEqual({ size: 12, color: "#000000" });
  });
  it("keeps defaults independent of saved values and resolves partial themes", () => {
    const saved = { color: "red" };
    expect(readThemeValues(saved, fields)).toEqual({ size: 12, color: "red" });
    expect(saved).toEqual({ color: "red" });
    expect(fields.size.default).toBe(12);
  });
});

describe("theme category structure", () => {
  it.each<{ name: string; category: ThemeCategory }>([
    { name: "direct fields", category: { label: "Category", fields } },
    {
      name: "subcategories",
      category: {
        label: "Category",
        subcategories: { group: { label: "Group", fields } },
      },
    },
    {
      name: "nested subcategories",
      category: {
        label: "Category",
        subcategories: {
          button: {
            label: "Button",
            fields: { size: fields.size },
            subcategories: {
              hover: { label: "Hover", fields: { color: fields.color } },
            },
          },
        },
      },
    },
  ])(
    "resolves $name with the same saved keys and CSS variables",
    ({ category }) => {
      const definitions = flattenThemeFields({ category });
      expect(readThemeValues({ size: 0 }, definitions)).toEqual({
        size: 0,
        color: "#000000",
      });
      expect(themeValuesToCss({ color: "red" }, definitions)).toEqual({
        "--size": "12px",
        "--color": "red",
      });
    }
  );
  it("supports direct fields and subcategories together", () => {
    const definitions = flattenThemeFields({
      mixed: {
        label: "Mixed",
        fields: { size: fields.size },
        subcategories: {
          colors: { label: "Colors", fields: { color: fields.color } },
        },
      },
    });
    expect(Object.keys(definitions)).toEqual(["size", "color"]);
    expect(themeValuesToCss({}, definitions)).toEqual({
      "--size": "12px",
      "--color": "#000000",
    });
  });
});

describe("recommended theme fields", () => {
  it("retains every field when flattening categories and emits distinct CSS variables", () => {
    const collectFields = (
      categories: Readonly<Record<string, ThemeCategory>>
    ): ThemeFields[string][] =>
      Object.values(categories).flatMap((category) => [
        ...Object.values(category.fields ?? {}),
        ...collectFields(category.subcategories ?? {}),
      ]);
    const categorizedFields = collectFields(themeCategories);
    expect(categorizedFields).toHaveLength(194);
    expect(Object.values(themeFields)).toHaveLength(categorizedFields.length);
    expect(new Set(categorizedFields.map((field) => field.variable)).size).toBe(
      categorizedFields.length
    );
    for (const field of categorizedFields) {
      expect(field.variable).toMatch(/^--ve-[a-z]+(?:-[a-z]+)*$/);
      if (field.type === "fontWeight" || field.type === "fontStyle") {
        expect(themeFields[field.fontFamilyKey]?.type).toBe("fontFamily");
      }
    }
  });

  it("serializes responsive lengths, unitless line heights, and interaction states independently", () => {
    const css = themeValuesToCss({
      headlineMobileFontSize: 30,
      headlineLineHeight: "1.25",
      primaryButtonPadding: "0.5rem 1rem",
      primaryButtonHoverTextColorOnDark: "#abcdef",
    });
    expect(css["--ve-headline-mobile-font-size"]).toBe("30px");
    expect(css["--ve-headline-line-height"]).toBe("1.25");
    expect(css["--ve-primary-button-padding"]).toBe("0.5rem 1rem");
    expect(css["--ve-primary-button-hover-text-color-on-dark"]).toBe("#abcdef");
    expect(css["--ve-primary-button-default-text-color-on-dark"]).toBe(
      "#FFFFFF"
    );
    expect(css["--ve-primary-button-active-text-color-on-dark"]).toBe(
      "#FFFFFF"
    );
  });
});

describe("typography role settings", () => {
  it("drops obsolete typography keys instead of treating them as current role settings", () => {
    const saved = {
      leadFontFamily: "serif",
      leadFontSize: 19,
      leadTextTransform: "uppercase",
      finePrintMobileFontSize: 11,
      finePrintFontWeight: "600",
    };
    expect(readThemeValues(saved)).toEqual(readThemeValues());
    expect(themeValuesToCss(saved)).toEqual(themeValuesToCss());
    expect(
      readThemeValues({ ...saved, eyebrowFontSize: 17 }).eyebrowFontSize
    ).toBe(17);
    expect(
      readThemeValues({ ...saved, bodySmallMobileFontSize: 13 })
        .bodySmallMobileFontSize
    ).toBe(13);
  });

  it("configures all three body roles independently for desktop and mobile", () => {
    const css = themeValuesToCss({
      bodySmallFontSize: 13,
      bodySmallMobileFontSize: 12,
      bodyFontSize: 17,
      bodyMobileFontSize: 15,
      bodyLargeFontSize: 21,
      bodyLargeMobileFontSize: 19,
      bodyLargeFontFamily: "serif",
      bodyLargeLineHeight: "1.7",
    });
    expect(css).toMatchObject({
      "--ve-body-small-font-size": "13px",
      "--ve-body-small-mobile-font-size": "12px",
      "--ve-body-font-size": "17px",
      "--ve-body-mobile-font-size": "15px",
      "--ve-body-large-font-size": "21px",
      "--ve-body-large-mobile-font-size": "19px",
      "--ve-body-large-font-family": "serif",
      "--ve-body-large-line-height": "1.7",
    });
  });
});
