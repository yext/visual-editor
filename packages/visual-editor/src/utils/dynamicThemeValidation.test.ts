import { describe, expect, test } from "vitest";
import { defaultThemeData } from "./defaultThemeData.ts";
import { themeDataSchema, validateThemeData } from "../types/themeData.ts";
import {
  buildThemeCss,
  themeCssVariables,
  themeVariable,
} from "./dynamicTheme.ts";
import {
  constructFontSelectOptions,
  defaultFonts,
  type FontRegistry,
} from "./fonts/visualEditorFonts.ts";

describe("dynamic theme fonts", () => {
  test("accepts available custom fonts and rejects unavailable or malformed custom stacks", () => {
    const customFonts: FontRegistry = {
      "Brand Font": { fallback: "serif", weights: [400], italics: false },
    };
    const theme = structuredClone(defaultThemeData);
    const [option] = constructFontSelectOptions(customFonts);
    theme.typography[0].fontFamily = option.value;
    theme.actions[0].fontFamily = option.value;
    expect(validateThemeData(theme, customFonts)).toMatchObject({
      success: true,
      errors: [],
      data: theme,
    });
    expect(validateThemeData(theme).success).toBe(false);
    for (const fontFamily of [
      "'Brand Font', serif",
      "'Brand Font', 'Other Fallback', serif",
      "'Brand Font', 'Brand Font Fallback', sans-serif",
    ]) {
      theme.typography[0].fontFamily = fontFamily;
      theme.actions[0].fontFamily = fontFamily;
      expect(
        validateThemeData(theme, customFonts).errors.map((issue) => issue.path)
      ).toEqual([
        ["typography", 0, "fontFamily"],
        ["actions", 0, "fontFamily"],
      ]);
    }
  });

  test("matches selector precedence when a custom font replaces a bundled family", () => {
    const customFonts: FontRegistry = {
      "Open Sans": { fallback: "serif", weights: [400], italics: false },
    };
    const theme = structuredClone(defaultThemeData);
    expect(validateThemeData(theme, customFonts).success).toBe(false);
    for (const entry of [...theme.typography, ...theme.actions]) {
      entry.fontFamily = constructFontSelectOptions(customFonts)[0].value;
    }
    expect(validateThemeData(theme, customFonts).success).toBe(true);
  });

  test("accepts every bundled selector value for typography and actions", () => {
    const theme = structuredClone(defaultThemeData);
    const options = constructFontSelectOptions(defaultFonts);
    theme.typography = options.map((option, index) => ({
      ...theme.typography[0],
      id: `font-${index}`,
      fontFamily: option.value,
    }));
    theme.actions = options.map((option, index) => ({
      ...theme.actions[0],
      id: `action-${index}`,
      fontFamily: option.value,
    }));
    expect(validateThemeData(theme).errors).toEqual([]);
  });

  test.each([
    "Open Sans",
    "'Open Sans', sans-serif",
    "'Open Sans', 'Roboto Fallback', sans-serif",
    "'Open Sans', 'Open Sans Fallback', serif",
    "'Unknown Font', 'Unknown Font Fallback', sans-serif",
    "'open sans', 'open sans Fallback', sans-serif",
    '"Open Sans", "Open Sans Fallback", sans-serif',
  ])("rejects fonts that do not match a selector value: %s", (fontFamily) => {
    const theme = structuredClone(defaultThemeData);
    theme.typography[0].fontFamily = fontFamily;
    theme.actions[0].fontFamily = fontFamily;
    const result = validateThemeData(theme);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors.map((issue) => issue.path)).toEqual([
      ["typography", 0, "fontFamily"],
      ["actions", 0, "fontFamily"],
    ]);
    expect(theme.typography[0].fontFamily).toBe(fontFamily);
  });
});

describe("action background states", () => {
  test("old themes fall back to light states on dark backgrounds", () => {
    const theme = structuredClone(defaultThemeData);
    expect(themeDataSchema.parse(theme)).toEqual(theme);
    const variables = themeCssVariables(theme);
    for (const entry of theme.actions) {
      for (const state of ["default", "hover", "active"] as const) {
        for (const property of Object.keys(entry[state])) {
          expect(
            variables[
              themeVariable("actions", entry.id, `onDark-${state}-${property}`)
            ]
          ).toBe(
            variables[
              themeVariable("actions", entry.id, `${state}-${property}`)
            ]
          );
        }
      }
    }
  });

  test("button and link states follow their nearest surface boundary", () => {
    const theme = structuredClone(defaultThemeData);
    for (const entry of [
      theme.actions[0],
      theme.actions.find((action) => action.presentation === "link")!,
    ]) {
      entry.onDark = structuredClone({
        default: entry.default,
        hover: entry.hover,
        active: entry.active,
      });
      entry.onDark.hover.textColor = {
        colorId: "main-white",
        channel: "background",
      };
      const variables = themeCssVariables(theme);
      expect(
        variables[themeVariable("actions", entry.id, "onDark-hover-textColor")]
      ).toBe("#FFFFFF");
      const css = buildThemeCss(theme);
      const surface = themeVariable(
        "actions",
        entry.id,
        "surface-hover-textColor"
      );
      const dark = `${surface}:var(${themeVariable("actions", entry.id, "onDark-hover-textColor")})`;
      const light = `${surface}:var(${themeVariable("actions", entry.id, "hover-textColor")})`;
      expect(
        css
          .match(/:where\(\[data-ve-background="main-black"\]\)\{[^}]*\}/g)
          ?.join("")
      ).toContain(dark);
      expect(
        css
          .match(/:where\(\[data-ve-background="main-white"\]\)\{[^}]*\}/g)
          ?.join("")
      ).toContain(light);
      expect(css.match(/:where\(\.ve-theme-on-dark\)\{[^}]*\}/)?.[0]).toContain(
        dark
      );
      expect(
        css.match(/:where\(\.ve-theme-on-light\)\{[^}]*\}/)?.[0]
      ).toContain(light);
      expect(css).toContain(
        `:where([data-ve-action="${entry.id}"]:hover){font-weight:`
      );
      expect(css).toContain(`color:var(${surface})`);
    }
  });

  test("validates dark state completeness and color references with paths", () => {
    const theme = structuredClone(defaultThemeData);
    const action = theme.actions[0];
    action.onDark = structuredClone({
      default: action.default,
      hover: action.hover,
      active: action.active,
    });
    action.onDark.hover.textColor = {
      colorId: "deleted",
      channel: "background",
    };
    expect(validateThemeData(theme).warnings).toContainEqual(
      expect.objectContaining({
        path: ["actions", 0, "onDark", "hover", "textColor"],
        code: "missing_reference",
      })
    );
    expect(
      validateThemeData({
        ...theme,
        actions: [{ ...action, onDark: { default: action.default } }],
      }).success
    ).toBe(false);
  });
});
