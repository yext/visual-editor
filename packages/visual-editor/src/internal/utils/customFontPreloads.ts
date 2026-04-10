import {
  FontRegistry,
  FontSpecification,
  findFontByDisplayName,
  type CustomFontVariant,
} from "../../utils/fonts/visualEditorFonts.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";
import { generateCssVariablesFromThemeConfig } from "./internalThemeResolver.ts";

export const CUSTOM_FONT_PRELOADS_KEY = "__customFontPreloads";
export const CUSTOM_FONTS_KEY = "__customFonts";

type FontStyleValue = "normal" | "italic";

export type CustomFontAssets = {
  fontFacePaths: string[];
  preloads: string[];
};

const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, "");

const extractFontFamilyName = (value: string): string => {
  const firstFont = value.split(",")[0];
  return stripQuotes(firstFont);
};

const getMergedThemeValues = (
  themeConfig: ThemeConfig,
  themeValues: ThemeData
): ThemeData => ({
  ...generateCssVariablesFromThemeConfig(themeConfig),
  ...themeValues,
});

const matchesWeight = (variant: CustomFontVariant, weight: number): boolean => {
  if ("fontWeight" in variant) {
    return variant.fontWeight === weight;
  }

  return variant.minWeight <= weight && weight <= variant.maxWeight;
};

const findMatchingVariant = (
  customFont: FontSpecification,
  fontStyle: FontStyleValue,
  weight: number
): CustomFontVariant | undefined => {
  return customFont.variants?.find(
    (variant) =>
      variant.fontStyle === fontStyle && matchesWeight(variant, weight)
  );
};

/**
 * Resolves the custom font stylesheets and exact preload targets referenced by
 * the merged theme values.
 */
export const buildCustomFontAssets = ({
  themeConfig,
  themeValues,
  customFonts,
}: {
  themeConfig: ThemeConfig;
  themeValues: ThemeData;
  customFonts: FontRegistry;
}): CustomFontAssets => {
  const mergedThemeValues = getMergedThemeValues(themeConfig, themeValues);
  const fontFacePaths = new Set<string>();
  const preloads: string[] = [];
  const seen = new Set<string>();

  Object.keys(mergedThemeValues).forEach((key) => {
    if (!key.startsWith("--fontFamily-") || !key.endsWith("-fontFamily")) {
      return;
    }

    const sectionKey = key
      .replace("--fontFamily-", "")
      .replace("-fontFamily", "");
    const fontFamilyValue = mergedThemeValues[key];
    if (typeof fontFamilyValue !== "string") {
      return;
    }

    const fontFamily = extractFontFamilyName(fontFamilyValue);
    const customFont = findFontByDisplayName(customFonts, fontFamily);
    if (!customFont) {
      return;
    }

    if (customFont.fontFacePath) {
      fontFacePaths.add(customFont.fontFacePath);
    }

    const weightValue =
      mergedThemeValues[`--fontWeight-${sectionKey}-fontWeight`];
    const weight = Number.parseInt(String(weightValue), 10);
    if (Number.isNaN(weight)) {
      return;
    }

    const fontStyleValue =
      mergedThemeValues[`--fontStyle-${sectionKey}-fontStyle`];
    const fontStyle: FontStyleValue =
      fontStyleValue === "italic" ? "italic" : "normal";

    const variant = findMatchingVariant(customFont, fontStyle, weight);
    if (!variant || seen.has(variant.fontFilePath)) {
      return;
    }

    seen.add(variant.fontFilePath);
    preloads.push(variant.fontFilePath);
  });

  return {
    fontFacePaths: [...fontFacePaths],
    preloads,
  };
};

/**
 * Removes saved custom font preload URLs from theme data before re-saving.
 */
export const removeCustomFontPreloads = (themeValues: ThemeData): ThemeData => {
  if (!(CUSTOM_FONT_PRELOADS_KEY in themeValues)) {
    return themeValues;
  }

  const rest = { ...themeValues };
  delete rest[CUSTOM_FONT_PRELOADS_KEY];
  return rest;
};

/**
 * Removes saved custom font stylesheet paths from theme data before re-saving.
 */
export const removeCustomFonts = (themeValues: ThemeData): ThemeData => {
  if (!(CUSTOM_FONTS_KEY in themeValues)) {
    return themeValues;
  }

  const rest = { ...themeValues };
  delete rest[CUSTOM_FONTS_KEY];
  return rest;
};

/**
 * Reads the saved custom font preload URLs from theme data.
 */
export const getCustomFontPreloads = (
  themeValues: ThemeData | undefined
): string[] => {
  if (!themeValues) {
    return [];
  }

  const preloads = themeValues[CUSTOM_FONT_PRELOADS_KEY];
  return Array.isArray(preloads) ? preloads.filter(Boolean) : [];
};

/**
 * Reads the saved custom font stylesheet paths from theme data.
 */
export const getCustomFontFacePaths = (
  themeValues: ThemeData | undefined
): string[] => {
  if (!themeValues) {
    return [];
  }

  const customFonts = themeValues[CUSTOM_FONTS_KEY];
  return Array.isArray(customFonts) ? customFonts.filter(Boolean) : [];
};

/**
 * Builds preload link HTML for the saved custom font file URLs.
 */
export const buildFontPreloadTags = (
  preloads: string[],
  relativePrefixToRoot: string
): string => {
  if (preloads.length === 0) {
    return "";
  }

  return (
    preloads
      .map((href) => {
        const normalizedHref =
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("/") ||
          href.startsWith("./") ||
          href.startsWith("../")
            ? href
            : `${relativePrefixToRoot}${href}`;

        return `<link rel="preload" href="${normalizedHref}" as="font" type="font/woff2" crossorigin="anonymous">`;
      })
      .join("\n") + "\n"
  );
};
