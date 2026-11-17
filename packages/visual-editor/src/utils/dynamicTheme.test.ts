import { describe, test, expect } from "vitest";
import {
  generateCssVariablesFromPuckFields,
  generateCssVariablesFromThemeConfig,
} from "../components/migrations/themeDataLabels.ts";
import { testThemeConfig } from "./testData.ts";

import { themeDataSchema, validateThemeData } from "../types/themeData.ts";
import {
  buildThemeCss,
  createThemeEntry,
  resolveThemeColor,
  resolveThemeEntry,
  themeCssVariables,
  themeVariable,
} from "./dynamicTheme.ts";
import { defaultThemeData } from "./defaultThemeData.ts";
import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import mainCases from "../internal/theme/fixtures/main/cases.json" with { type: "json" };
import directoryTheme from "../internal/theme/fixtures/main/directory-theme.json" with { type: "json" };

describe("dynamic theme payload and runtime", () => {
  test("updates all generated default labels and preserves authored names", () => {
    const legacy = migrateThemeData();
    for (const collection of ["colors", "typography", "actions"] as const) {
      for (const entry of legacy[collection]) {
        entry.label = entry.label.toLowerCase();
      }
    }
    expect(migrateThemeData(legacy)).toEqual(defaultThemeData);
    legacy.actions[0].label = "my custom button";
    legacy.typography[0].label = "custom body";
    legacy.colors[0].label = "custom white";
    const migrated = migrateThemeData(legacy);
    expect(migrated.actions[0].label).toBe("my custom button");
    expect(migrated.typography[0].label).toBe("custom body");
    expect(migrated.colors[0].label).toBe("custom white");
  });

  test("migrates main defaults and customized fixtures deterministically", () => {
    for (const legacy of [...Object.values(mainCases.themes), directoryTheme]) {
      const theme = migrateThemeData(legacy);
      // Legacy shorthand font stacks remain renderable; newly saved payloads
      // must use a complete selector value.
      expect(themeDataSchema.parse(theme)).toEqual(theme);
      expect(validateThemeData(theme).warnings).toEqual([]);
      expect(migrateThemeData(legacy)).toEqual(theme);
      expect(migrateThemeData(theme)).toEqual(theme);
      expect(legacy).not.toHaveProperty("version");
    }
    const defaults = migrateThemeData();
    expect(defaults).toEqual(defaultThemeData);
    expect(
      defaults.typography
        .filter((entry) => /^main-h[1-6]$/.test(entry.id))
        .map((entry) => entry.mobileFontSize)
    ).toEqual([40, 32, 24, 20, 18, 18]);
    const customized = migrateThemeData(mainCases.themes.customized);
    expect(
      customized.typography.find((entry) => entry.id === "main-h1")
    ).toMatchObject({
      fontSize: 60,
      mobileFontSize: 36,
      fontFamily: "'Roboto', sans-serif",
    });
    expect(
      customized.colors.find((entry) => entry.id === "main-primary")?.background
    ).toBe("#173B62");
  });

  test("rejects duplicate identifiers, empty collections, malformed values and missing properties with paths", () => {
    for (const collection of ["colors", "typography", "actions"] as const) {
      const theme = migrateThemeData();
      theme[collection].push(structuredClone(theme[collection][0]) as never);
      expect(validateThemeData(theme).errors).toContainEqual(
        expect.objectContaining({
          path: [collection, theme[collection].length - 1, "id"],
        })
      );
      theme[collection] = [];
      expect(validateThemeData(theme).errors).toContainEqual(
        expect.objectContaining({ path: [collection] })
      );
    }
    const incomplete: any = migrateThemeData();
    delete incomplete.typography[0].mobileFontSize;
    delete incomplete.typography[0].mobileLineHeight;
    delete incomplete.actions[0].active.textColor;
    incomplete.typography[0].fontSize = -1;
    incomplete.actions[0].padding = "nope";
    const result = validateThemeData(incomplete);
    expect(result.success).toBe(false);
    expect(result.errors.map((issue) => issue.path)).toEqual(
      expect.arrayContaining([
        ["typography", 0, "mobileFontSize"],
        ["typography", 0, "mobileLineHeight"],
        ["typography", 0, "fontSize"],
        ["actions", 0, "active", "textColor"],
        ["actions", 0, "padding"],
      ])
    );
  });

  test("requires every state and mobile property and forbids typography group references in actions", () => {
    const baseline = migrateThemeData();
    for (const action of baseline.actions) {
      for (const property of [
        "mobileFontSize",
        "mobileLineHeight",
        "default",
        "hover",
        "active",
      ]) {
        const candidate: any = structuredClone(baseline);
        delete candidate.actions.find((entry: any) => entry.id === action.id)[
          property
        ];
        expect(themeDataSchema.safeParse(candidate).success).toBe(false);
      }
    }
    expect(
      themeDataSchema.safeParse({
        ...baseline,
        actions: [
          { ...baseline.actions[0], typographyId: baseline.typography[0].id },
        ],
      }).success
    ).toBe(false);
  });

  test("warns on missing references and falls back without rewriting selections", () => {
    const theme = migrateThemeData();
    theme.actions[0].hover.textColor = {
      colorId: "deleted",
      channel: "foreground",
    };
    const before = structuredClone(theme);
    expect(validateThemeData(theme)).toMatchObject({
      success: true,
      errors: [],
      warnings: [
        {
          code: "missing_reference",
          path: ["actions", 0, "hover", "textColor"],
        },
      ],
    });
    expect(resolveThemeColor(theme, theme.actions[0].hover.textColor)).toBe(
      theme.colors[0].foreground
    );
    expect(buildThemeCss(theme)).toContain(
      `${themeVariable("actions", "main-primary", "hover-textColor")}:#000000`
    );
    expect(theme).toEqual(before);
  });

  test("supports alpha, gradients, pair inheritance and individual channels", () => {
    const theme = migrateThemeData();
    theme.colors[0] = {
      id: "ocean",
      label: "Ocean / sea",
      background:
        "linear-gradient(90deg, #12345680 0%, rgba(40, 60, 80, 0.4) 100%)",
      foreground: "#FFFFFFAA",
    };
    expect(validateThemeData(theme).success).toBe(true);
    expect(
      resolveThemeColor(theme, { colorId: "ocean", channel: "background" })
    ).toContain("linear-gradient");
    expect(
      resolveThemeColor(theme, { colorId: "ocean", channel: "foreground" })
    ).toBe("#FFFFFFAA");
    const css = buildThemeCss(theme);
    expect(css).toContain(
      `:where([data-ve-background="ocean"]){background:var(${themeVariable("colors", "ocean", "background")});color:var(${themeVariable("colors", "ocean", "foreground")})}`
    );
    expect(css).not.toContain("Ocean / sea");
    for (const background of [
      "url(https://example.com)",
      "#GGGGGG",
      "rgb(999, 0, 0)",
      "red; color:blue",
      "linear-gradient(red, invalid)",
    ]) {
      expect(
        validateThemeData({
          ...theme,
          colors: [{ ...theme.colors[0], background }],
        }).success
      ).toBe(false);
    }
  });

  test("uses the first compatible solid color for text and border references", () => {
    const theme = migrateThemeData();
    theme.colors[0].background = "linear-gradient(#fff, #000)";
    theme.actions[0].default.textColor = {
      colorId: theme.colors[0].id,
      channel: "background",
    };
    expect(validateThemeData(theme).warnings[0].code).toBe(
      "incompatible_reference"
    );
    expect(
      resolveThemeColor(theme, theme.actions[0].default.textColor, true)
    ).toBe(theme.colors[1].background);
    theme.colors = theme.colors.slice(0, 1);
    expect(
      resolveThemeColor(theme, theme.actions[0].default.textColor, true)
    ).toBe(theme.colors[0].foreground);
  });

  test("arbitrary identities, names and counts generate styles with independent action typography", () => {
    const theme = migrateThemeData();
    theme.typography = [
      { ...theme.typography[0], id: "campaign-title", label: "Spring sale" },
    ];
    theme.actions = [
      {
        ...theme.actions[0],
        id: "buy",
        label: "Buy now",
        fontFamily: "'Roboto', sans-serif",
      },
    ];
    theme.colors = [
      {
        id: "sunset",
        label: "Sunset",
        background: "#FA8060",
        foreground: "#123456",
      },
    ];
    theme.actions[0].default.textColor = {
      colorId: "sunset",
      channel: "foreground",
    };
    const css = buildThemeCss(theme);
    expect(css).toContain('[data-ve-typography="campaign-title"]');
    expect(css).toContain('[data-ve-action="buy"]:hover');
    expect(css).toContain('[data-ve-action="buy"]:active');
    expect(css).toContain("@media (width < 640px)");
    expect(
      themeCssVariables(theme)[themeVariable("actions", "buy", "fontFamily")]
    ).toBe("'Roboto', sans-serif");
    expect(css).toContain(":where(.ve-theme-on-dark)");
    expect(css).not.toContain("--colors-palette");
    expect(css).not.toContain("Spring sale");
    expect(resolveThemeEntry(theme.typography, "missing").id).toBe(
      "campaign-title"
    );
  });

  test("stable selections survive renaming, reordering and independently initialized entries", () => {
    const theme = migrateThemeData();
    const selected = theme.typography[0].id;
    theme.typography[0].label = "Renamed";
    theme.typography.reverse();
    expect(resolveThemeEntry(theme.typography, selected).label).toBe("Renamed");
    expect(resolveThemeEntry(theme.typography).id).toBe(theme.typography[0].id);
    const added = createThemeEntry(theme, "actions", "new-action", "New");
    added.default.fontWeight = "900";
    expect(theme.actions[0].default.fontWeight).toBe("400");
    expect(
      themeDataSchema.safeParse({
        ...theme,
        actions: [...theme.actions, added],
      }).success
    ).toBe(true);
  });

  test("entry identifiers cannot collide with another entry's property suffix", () => {
    expect(themeVariable("typography", "campaign", "mobileFontSize")).not.toBe(
      themeVariable("typography", "campaign-mobile", "fontSize")
    );
    expect(themeVariable("actions", "campaign", "hover-textColor")).not.toBe(
      themeVariable("actions", "campaign-hover", "textColor")
    );
  });
});

describe("generateCssVariablesFromThemeConfig", () => {
  test("generates css variables with default values", () => {
    const result = generateCssVariablesFromThemeConfig(testThemeConfig);
    expect(result).toEqual(defaultThemeValues);
  });
});

describe("generateCssVariablesFromPuckFields", () => {
  test("generates css variables from Puck field", () => {
    const result = generateCssVariablesFromPuckFields(
      { primary: "green" },
      "palette",
      {
        label: "Palette",
        styles: {
          primary: {
            label: "Primary",
            type: "color",
            default: "black",
            plugin: "colors",
          },
        },
      }
    );
    expect(result).toEqual({
      "--colors-palette-primary": "green",
      "--colors-palette-primary-contrast": "#000000",
    });
  });

  test("generates css variables from nested Puck fields", () => {
    const result = generateCssVariablesFromPuckFields(
      {
        primary: {
          default: "#00FF00",
          foreground: "#003300",
        },
      },
      "palette",
      {
        label: "Palette",
        styles: {
          primary: {
            label: "Primary",
            plugin: "colors",
            styles: {
              default: {
                label: "Default",
                type: "color",
                default: "black",
              },
              foreground: {
                label: "Foreground",
                type: "color",
                default: "white",
              },
            },
          },
        },
      }
    );
    expect(result).toEqual({
      "--colors-palette-primary-default": "#00FF00",
      "--colors-palette-primary-foreground": "#003300",
      "--colors-palette-primary-default-contrast": "#000000",
      "--colors-palette-primary-foreground-contrast": "#FFFFFF",
    });
  });

  test("generates css variables from fontStyle select fields", () => {
    const result = generateCssVariablesFromPuckFields(
      { fontStyle: "italic" },
      "body",
      {
        label: "Body",
        styles: {
          fontStyle: {
            label: "Font Style",
            type: "select",
            default: "normal",
            plugin: "fontStyle",
            options: [],
          },
        },
      }
    );

    expect(result).toEqual({
      "--fontStyle-body-fontStyle": "italic",
    });
  });
});

const defaultThemeValues = {
  "--colors-palette-primary": "#D83B18",
  "--colors-palette-secondary": "#871900",
  "--colors-palette-accent": "#FFFFFF",
  "--colors-palette-text": "#000000",
  "--colors-palette-background-light": "#FFFFFF",
  "--colors-palette-background-DEFAULT": "#F7F7F7",
  "--colors-palette-background-dark": "#F0F0F0",
  "--colors-palette-foreground": "#000000",
  "--colors-heading1-color": "var(--colors-palette-primary)",
  "--colors-heading2-color": "var(--colors-palette-primary)",
  "--colors-heading3-color": "var(--colors-palette-primary)",
  "--colors-heading4-color": "var(--colors-palette-secondary)",
  "--colors-heading5-color": "var(--colors-palette-secondary)",
  "--colors-heading6-color": "var(--colors-palette-secondary)",
  "--colors-body-color-light": "var(--colors-palette-text)",
  "--colors-body-color-dark": "var(--colors-palette-text)",
  "--colors-button-primary": "var(--colors-palette-primary)",
  "--colors-button-primaryForeground": "var(--colors-palette-foreground)",
  "--fontSize-heading1-fontSize": "24px",
  "--fontSize-heading2-fontSize": "24px",
  "--fontSize-heading3-fontSize": "24px",
  "--fontSize-heading4-fontSize": "24px",
  "--fontSize-heading5-fontSize": "24px",
  "--fontSize-heading6-fontSize": "24px",
  "--fontSize-body-fontSize": "12px",
  "--fontSize-button-fontSize": "12px",
  "--fontWeight-heading1-fontWeight": "700",
  "--fontWeight-heading2-fontWeight": "700",
  "--fontWeight-heading3-fontWeight": "700",
  "--fontWeight-heading4-fontWeight": "700",
  "--fontWeight-heading5-fontWeight": "700",
  "--fontWeight-heading6-fontWeight": "700",
  "--fontWeight-body-fontWeight": "400",
  "--fontWeight-button-fontWeight": "400",
  "--gap-pageSection-gap": "8px",
  "--verticalPadding-pageSection-verticalPadding": "0px",
  "--horizontalPadding-pageSection-horizontalPadding": "0px",
  "--backgroundColor-pageSection-backgroundColor":
    "var(--colors-palette-background)",
  "--backgroundColor-page-backgroundColor": "var(--colors-palette-background)",
  "--backgroundColor-page-footer": "#000000",
  "--maxWidth-pageSection-maxWidth": "1280px",
  "--borderRadius-button-borderRadius": "20px",
};
