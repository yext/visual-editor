import {
  type Fonts,
  type Font,
  type Variant,
} from "../../utils/fonts/visualEditorFonts.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";
import { generateCssVariablesFromThemeConfig } from "./internalThemeResolver.ts";

/**
 * Custom font asset flow:
 * 1. Merge default theme values with the current edited theme values.
 * 2. Find each custom font family referenced by the merged theme font-family variables.
 * 3. Collect the matching `facePath` values for stylesheet loading.
 * 4. Match each referenced family's style/weight selection to a variant `filePath` for preloading.
 * 5. Save those resolved asset lists back into theme data for runtime use.
 */
export const CUSTOM_FONT_PRELOADS_KEY = "__customFontPreloads";
export const CUSTOM_FONTS_KEY = "__customFonts";

export type CustomFontAssets = {
  facePaths: string[];
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

const matchesWeight = (asset: Variant | Font, weight: number): boolean => {
  if ("weights" in asset) {
    return asset.weights.includes(weight);
  }

  return asset.minWeight <= weight && weight <= asset.maxWeight;
};

const findMatchingVariant = (
  customFont: Font,
  style: "normal" | "italic",
  weight: number
): Variant | undefined => {
  return customFont.variants?.find(
    (variant) => variant.style === style && matchesWeight(variant, weight)
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
  customFonts: Fonts;
}): CustomFontAssets => {
  const mergedThemeValues = getMergedThemeValues(themeConfig, themeValues);
  const facePaths = new Set<string>();
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
    const customFont = customFonts[fontFamily];
    if (!customFont) {
      return;
    }

    if (customFont.facePath) {
      facePaths.add(customFont.facePath);
    }

    const weightValue =
      mergedThemeValues[`--fontWeight-${sectionKey}-fontWeight`];
    const weight = Number.parseInt(String(weightValue), 10);
    if (Number.isNaN(weight)) {
      return;
    }

    const fontStyleValue =
      mergedThemeValues[`--fontStyle-${sectionKey}-fontStyle`];
    const style = fontStyleValue === "italic" ? "italic" : "normal";

    const variant = findMatchingVariant(customFont, style, weight);
    if (!variant || seen.has(variant.filePath)) {
      return;
    }

    seen.add(variant.filePath);
    preloads.push(variant.filePath);
  });

  return {
    facePaths: [...facePaths],
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
export const getCustomFacePaths = (
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
