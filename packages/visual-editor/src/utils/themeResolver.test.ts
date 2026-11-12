import { describe, it, expect } from "vitest";
import { deepMerge } from "./themeResolver.ts";
import { defaultThemeTailwindExtensions } from "./themeConfigOptions.ts";
import { legacyThemeTailwindMappings } from "../internal/theme/legacyTheme.ts";

describe("Tailwind compatibility", () => {
  it("retains component utility mappings alongside derived colors", () => {
    expect(defaultThemeTailwindExtensions.fontFamily).toEqual(
      legacyThemeTailwindMappings.fontFamily
    );
    expect(defaultThemeTailwindExtensions.colors["palette-primary"]).toBe(
      "var(--colors-palette-primary)"
    );
    expect(
      defaultThemeTailwindExtensions.colors["palette-primary-light"]
    ).toContain("var(--colors-palette-primary)");
  });
  it("merges nested extensions and prioritizes the first argument", () => {
    expect(
      deepMerge(
        { colors: { primary: "red" } },
        { colors: { primary: "blue", secondary: "green" } }
      )
    ).toEqual({ colors: { primary: "red", secondary: "green" } });
  });
});
