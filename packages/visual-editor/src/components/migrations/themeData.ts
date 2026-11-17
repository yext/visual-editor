import type { StyleSelectOption, TailwindConfig } from "../../types/types.ts";
import { deepMerge } from "../../utils/deepMerge.ts";
import {
  themeDataSchema,
  typographyProperties,
  actionProperties,
  buttonProperties,
  pageProperties,
  type ThemeData,
  type ThemeColorReference,
} from "../../types/themeData.ts";
import { themePropertyDefaults } from "../../utils/dynamicTheme.ts";
import { getContrastingColor, hexToRGB } from "../../utils/colors.ts";
import mainDefaults from "../../internal/theme/fixtures/main/default-values.json" with { type: "json" };

/** This snapshot is immutable. Never resolve old themes against current defaults. */
export const migrateThemeData = (input: unknown = {}): ThemeData => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Theme data must be an object");
  }
  const saved = input as Record<string, unknown>;
  if ("version" in saved) {
    return themeDataSchema.parse(saved);
  }
  const legacy: Record<string, unknown> = { ...mainDefaults };
  for (const [key, entry] of Object.entries(saved)) {
    if (typeof entry === "string" && entry.trim()) {
      legacy[key] = entry;
    }
  }
  const value = (key: string, visited = new Set<string>()): string => {
    const raw = legacy[key];
    if (visited.has(key)) {
      throw new Error(`Circular legacy theme reference: ${key}`);
    }
    visited.add(key);
    return String(raw ?? "").replace(
      /var\((--[\w-]+)\)/g,
      (_match, reference: string) => value(reference, new Set(visited))
    );
  };
  const number = (key: string): number => Number.parseFloat(value(key));
  const typography = (section: string) => ({
    ...themePropertyDefaults(typographyProperties),
    lineHeight: section.startsWith("h") ? "1.2" : "1.5",
    mobileLineHeight: section.startsWith("h") ? "1.2" : "1.5",
    fontFamily: value(`--fontFamily-${section}-fontFamily`),
    fontSize: number(`--fontSize-${section}-fontSize`),
    mobileFontSize: number(`--fontSize-${section}-fontSize`),
    fontWeight: value(`--fontWeight-${section}-fontWeight`),
    fontStyle: value(`--fontStyle-${section}-fontStyle`),
    textTransform: value(`--textTransform-${section}-textTransform`),
  });
  const colors: ThemeData["colors"] = [
    {
      id: "main-white",
      label: "White",
      background: "#FFFFFF",
      foreground: "#000000",
    },
    {
      id: "main-black",
      label: "Black",
      background: "#000000",
      foreground: "#FFFFFF",
    },
    {
      id: "main-transparent",
      label: "Transparent",
      background: "transparent",
      foreground: "#000000",
    },
  ];
  for (const name of ["primary", "secondary", "tertiary", "quaternary"]) {
    const background = value(`--colors-palette-${name}`);
    colors.push({
      id: `main-${name}`,
      label: name[0].toUpperCase() + name.slice(1),
      background,
      foreground:
        typeof legacy[`--colors-palette-${name}-contrast`] === "string"
          ? value(`--colors-palette-${name}-contrast`)
          : getContrastingColor(background, 12, 400),
    });
    const rgb = hexToRGB(background)?.map((channel) => channel / 255);
    let hue = 0;
    let saturation = 0;
    if (rgb) {
      const [red, green, blue] = rgb;
      const maximum = Math.max(...rgb);
      const minimum = Math.min(...rgb);
      const difference = maximum - minimum;
      if (difference > 0) {
        saturation = Math.min(
          1,
          difference / (1 - Math.abs(maximum + minimum - 1))
        );
        hue =
          maximum === red
            ? ((green - blue) / difference) % 6
            : maximum === green
              ? (blue - red) / difference + 2
              : (red - green) / difference + 4;
        hue = (hue * 60 + 360) % 360;
      }
    }
    for (const tone of ["light", "dark"] as const) {
      colors.push({
        id: `main-${name}-${tone}`,
        label: `${name} ${tone}`,
        background: rgb
          ? `hsl(${hue} ${saturation * 100}% ${tone === "light" ? 98 : 20}%)`
          : background,
        foreground: tone === "light" ? "#000000" : "#FFFFFF",
      });
    }
  }
  const reference = (
    colorId: string,
    channel: ThemeColorReference["channel"] = "background"
  ): ThemeColorReference => ({ colorId, channel });
  const actions = [
    "primary",
    "secondary",
    "link",
    "directoryLink",
    "headerFooterMainLink",
    "headerFooterSecondaryLink",
  ].map((variant) => {
    const isButton = variant === "primary" || variant === "secondary";
    const { fontWeight, ...text } = typography(isButton ? "button" : "link");
    const state = {
      fontWeight,
      textDecoration:
        isButton || variant.startsWith("headerFooter") ? "none" : "underline",
      textColor:
        variant === "primary"
          ? reference("main-primary", "foreground")
          : reference("main-primary-dark"),
      ...(isButton
        ? {
            backgroundColor: reference(
              variant === "primary" ? "main-primary" : "main-transparent"
            ),
            borderColor: reference(
              variant === "primary" ? "main-primary" : "main-primary-dark"
            ),
          }
        : {}),
    };
    return {
      id: `main-${variant}`,
      label: variant,
      ...themePropertyDefaults(actionProperties),
      ...text,
      letterSpacing: value(
        `--letterSpacing-${isButton ? "button" : "link"}-letterSpacing`
      ),
      presentation: isButton ? "button" : "link",
      ...(variant === "headerFooterMainLink" ||
      variant === "headerFooterSecondaryLink"
        ? {
            fontSize:
              text.fontSize - (variant === "headerFooterMainLink" ? 2 : 4),
            mobileFontSize:
              text.mobileFontSize -
              (variant === "headerFooterMainLink" ? 2 : 4),
          }
        : {}),
      ...(isButton
        ? {
            ...themePropertyDefaults(buttonProperties),
            borderRadius: number("--borderRadius-button-borderRadius"),
          }
        : {}),
      default: state,
      hover: {
        ...state,
        textDecoration:
          isButton || variant.startsWith("headerFooter") ? "underline" : "none",
      },
      active: {
        ...state,
        textDecoration:
          isButton || variant.startsWith("headerFooter") ? "underline" : "none",
      },
    };
  });
  const inverseActions = actions
    .filter((entry) => entry.id !== "main-primary")
    .map((entry) => ({
      ...entry,
      id: `${entry.id}-inverse`,
      label: `${entry.label} inverse`,
      default: {
        ...entry.default,
        textColor: reference("main-white"),
        ...(entry.presentation === "button"
          ? { borderColor: reference("main-white") }
          : {}),
      },
      hover: {
        ...entry.hover,
        textColor: reference("main-white"),
        ...(entry.presentation === "button"
          ? { borderColor: reference("main-white") }
          : {}),
      },
      active: {
        ...entry.active,
        textColor: reference("main-white"),
        ...(entry.presentation === "button"
          ? { borderColor: reference("main-white") }
          : {}),
      },
    }));
  return themeDataSchema.parse({
    version: 1,
    colors,
    typography: [
      { id: "main-body", label: "Body", ...typography("body") },
      ...(["xs", "sm", "lg"] as const).map((variant) => ({
        id: `main-body-${variant}`,
        label: `Body ${variant}`,
        ...typography("body"),
        fontSize:
          number("--fontSize-body-fontSize") +
          { xs: -4, sm: -2, lg: 2 }[variant],
        mobileFontSize:
          number("--fontSize-body-fontSize") +
          { xs: -4, sm: -2, lg: 2 }[variant],
      })),
      ...Array.from({ length: 6 }, (_, index) => ({
        id: `main-h${index + 1}`,
        label: `Heading ${index + 1}`,
        ...typography(`h${index + 1}`),
        mobileFontSize: number(
          `--fontSize-h${Math.min(index + 2, 6)}-fontSize`
        ),
      })),
    ],
    actions: [...actions, ...inverseActions],
    page: {
      ...themePropertyDefaults(pageProperties),
      imageBorderRadius: number("--borderRadius-image-borderRadius"),
      pageContentMaxWidth: number("--maxWidth-pageSection-contentWidth"),
      pageSectionVerticalSpacing: number(
        "--padding-pageSection-verticalPadding"
      ),
    },
    ...(saved.__customFontAssets
      ? { __customFontAssets: saved.__customFontAssets }
      : {}),
  });
};

/** Upgrade every undo/redo entry without changing its identity or position. */
export const migrateThemeHistories = <T extends { data: unknown }>(
  histories: T[]
): (Omit<T, "data"> & { data: ThemeData })[] =>
  histories.map((entry) => ({ ...entry, data: migrateThemeData(entry.data) }));

// Frozen adapters for historical developer theme configurations.
export type CoreStyle =
  | {
      label: string;
      type: "number";
      default: number;
    }
  | {
      label: string;
      type: "select";
      default: string;
      options: StyleSelectOption[] | (() => StyleSelectOption[]);
    }
  | {
      label: string;
      type: "color";
      default: string;
    };

export type Style = CoreStyle & { plugin: string };

export type StyleGroup = {
  label: string;
  plugin: string;
  styles: { [key: string]: CoreStyle };
};

export type ThemeConfigSection = {
  label: string;
  styles: { [key: string]: Style | StyleGroup };
};

export type ThemeConfig = {
  [key: string]: ThemeConfigSection;
};

export const convertToTailwindConfig = (
  themeConfig: ThemeConfig
): TailwindConfig => {
  const output: TailwindConfig = {};

  for (const themeSectionKey in themeConfig) {
    const themeSectionStyles = themeConfig[themeSectionKey].styles;

    for (const styleKey in themeSectionStyles) {
      const style = themeSectionStyles[styleKey];

      if (!output[style.plugin]) {
        // add theme extension to tailwindConfig if it does not exist
        output[style.plugin] = {};
      }

      if ("default" in style) {
        // If it's type Style, assign a class name and CSS variable
        output[style.plugin][`${themeSectionKey}-${styleKey}`] =
          `var(--${style.plugin}-${themeSectionKey}-${styleKey})`;
      } else if ("styles" in style) {
        // If it's type StyleGroup, construct an object with class names and CSS variables
        const styleGroupValues: Record<string, any> = {};

        for (const subkey in style.styles) {
          styleGroupValues[subkey] =
            `var(--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey})`;
        }

        // add the object extension to the tailwindConfig
        output[style.plugin][`${themeSectionKey}-${styleKey}`] =
          styleGroupValues;
      }
    }
  }

  return output;
};

export const themeResolver = (
  developerTheming: TailwindConfig,
  marketerTheming: ThemeConfig
): TailwindConfig => {
  const marketerTailwindConfig = convertToTailwindConfig(marketerTheming);
  return deepMerge(developerTheming, marketerTailwindConfig);
};

// generateCssVariablesFromThemeConfig flattens the themeConfig, creating an object
// mapping css variable names to the themeConfig's default values
export const generateCssVariablesFromThemeConfig = (
  themeConfig: ThemeConfig
) => {
  const defaultValues: Record<string, any> = {};
  for (const themeSectionKey in themeConfig) {
    const themeSection = themeConfig[themeSectionKey].styles;

    for (const styleKey in themeSection) {
      const style = themeSection[styleKey];

      if ("default" in style) {
        defaultValues[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          typeof style.default === "number"
            ? `${style.default}px`
            : style.default;
      } else if ("styles" in style) {
        for (const subkey in style.styles) {
          defaultValues[
            `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`
          ] =
            typeof style.styles[subkey].default === "number"
              ? `${style.styles[subkey].default}px`
              : style.styles[subkey].default;
        }
      }
    }
  }
  return defaultValues;
};

// generateCssVariablesFromPuckFields flattens the puck sidebar fields, creating an object
// mapping css variable names to the current puck values
export const generateCssVariablesFromPuckFields = (
  fields: Record<string, any>,
  themeSectionKey: string,
  themeSection: ThemeConfigSection
) => {
  const result: Record<string, any> = {};

  for (const styleKey in themeSection.styles) {
    const style = themeSection.styles[styleKey];
    if ("default" in style) {
      if (style.type === "number") {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey] + "px";
      } else if (style.type === "color") {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey];
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}-contrast`] =
          getContrastingColor(fields[styleKey], 12, 400);
      } else {
        result[`--${style.plugin}-${themeSectionKey}-${styleKey}`] =
          fields[styleKey];
      }
    } else {
      for (const subkey in style.styles) {
        const substyle = style.styles[subkey];
        if (substyle.type === "number") {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey] + "px";
        } else if (substyle.type === "color") {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey];
          result[
            `--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}-contrast`
          ] = getContrastingColor(fields[styleKey][subkey], 12, 400);
        } else {
          result[`--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey}`] =
            fields[styleKey][subkey];
        }
      }
    }
  }

  return result;
};
