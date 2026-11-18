import {
  type FontRegistry,
  type Font,
  type FontVariant,
  getFontFamilyFromThemeValue,
  normalizeAssetPath,
} from "../../utils/fonts/visualEditorFonts.ts";
import { readThemeValues } from "./internalThemeResolver.ts";
import { themeFields, type ThemeFields } from "../theme/themeFields.ts";
import { ThemeData } from "../types/themeData.ts";

/**
 * Custom font asset flow:
 * 1. Read explicitly selected values from the fixed theme fields.
 * 2. Find selected font families using field types and explicit field relationships.
 * 3. Collect the matching stylesheet paths for loading.
 * 4. Match each referenced family's style/weight selection to a variant `filePath` for preloading.
 * 5. Save those resolved asset lists back into theme data for runtime use.
 */
export const CUSTOM_FONT_ASSETS_KEY = "__customFontAssets";

export type CustomFontAssets = {
  stylesheetPaths: string[];
  preloads: string[];
};

const PRELOAD_MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
};

const matchesWeight = (asset: FontVariant | Font, weight: number): boolean => {
  if ("weights" in asset) {
    return asset.weights.includes(weight);
  }

  return asset.minWeight <= weight && weight <= asset.maxWeight;
};

const findMatchingVariant = (
  customFont: Font,
  style: "normal" | "italic",
  weight: number
): FontVariant | undefined => {
  return customFont.variants?.find(
    (variant) => variant.style === style && matchesWeight(variant, weight)
  );
};

/**
 * Resolves the custom font stylesheets and exact preload targets referenced by
 * the merged theme values.
 */
export const buildCustomFontAssets = ({
  fields = themeFields,
  themeValues,
  customFonts,
}: {
  fields?: ThemeFields;
  themeValues: ThemeData;
  customFonts: FontRegistry;
}): CustomFontAssets => {
  const mergedThemeValues = readThemeValues(themeValues, fields);
  const stylesheetPaths = new Set<string>();
  const preloads = new Set<string>();

  const fieldEntries = Object.entries(fields);
  fieldEntries.forEach(([fieldKey, field]) => {
    if (field.type !== "fontFamily") return;
    const fontFamilyValue = mergedThemeValues[fieldKey];
    if (typeof fontFamilyValue !== "string") {
      return;
    }

    const fontFamily = getFontFamilyFromThemeValue(
      fontFamilyValue,
      mergedThemeValues
    );
    const customFont = customFonts[fontFamily];
    if (!customFont) {
      return;
    }

    if (customFont.facePath) {
      stylesheetPaths.add(customFont.facePath);
    }

    const weightValue =
      mergedThemeValues[
        fieldEntries.find(
          ([, candidate]) =>
            candidate.type === "fontWeight" &&
            candidate.fontFamilyKey === fieldKey
        )?.[0] ?? ""
      ];
    const weight = Number.parseInt(String(weightValue), 10);
    if (Number.isNaN(weight)) {
      return;
    }

    const fontStyleValue =
      mergedThemeValues[
        fieldEntries.find(
          ([, candidate]) =>
            candidate.type === "fontStyle" &&
            candidate.fontFamilyKey === fieldKey
        )?.[0] ?? ""
      ];
    const style = fontStyleValue === "italic" ? "italic" : "normal";

    const variant = findMatchingVariant(customFont, style, weight);
    if (variant) {
      preloads.add(variant.filePath);
    }
  });

  return {
    stylesheetPaths: [...stylesheetPaths],
    preloads: [...preloads],
  };
};

/**
 * Resolves and writes custom font assets into theme data, or removes the key
 * entirely when no custom font assets are needed.
 */
export const updateThemeWithCustomFontAssets = ({
  fields = themeFields,
  themeValues,
  customFonts,
}: {
  fields?: ThemeFields;
  themeValues: ThemeData;
  customFonts?: FontRegistry;
}): ThemeData => {
  if (!customFonts || Object.keys(customFonts).length === 0) {
    if (!(CUSTOM_FONT_ASSETS_KEY in themeValues)) {
      return themeValues;
    }

    const rest = { ...themeValues };
    delete rest[CUSTOM_FONT_ASSETS_KEY];
    return rest;
  }

  const customFontAssets = buildCustomFontAssets({
    fields,
    themeValues,
    customFonts,
  });

  const next = { ...themeValues };
  delete next[CUSTOM_FONT_ASSETS_KEY];
  if (
    customFontAssets.stylesheetPaths.length ||
    customFontAssets.preloads.length
  ) {
    next[CUSTOM_FONT_ASSETS_KEY] = customFontAssets;
  }
  return next;
};

/**
 * Reads the saved custom font assets from theme data.
 */
export const getCustomFontAssets = (
  themeValues: ThemeData | undefined
): CustomFontAssets => {
  if (!themeValues) {
    return {
      stylesheetPaths: [],
      preloads: [],
    };
  }

  const assets = themeValues[CUSTOM_FONT_ASSETS_KEY];
  if (!assets || typeof assets !== "object") {
    return {
      stylesheetPaths: [],
      preloads: [],
    };
  }

  return {
    stylesheetPaths: Array.isArray((assets as CustomFontAssets).stylesheetPaths)
      ? (assets as CustomFontAssets).stylesheetPaths.filter(
          (entry): entry is string => typeof entry === "string"
        )
      : [],
    preloads: Array.isArray((assets as CustomFontAssets).preloads)
      ? (assets as CustomFontAssets).preloads.filter(
          (entry): entry is string => typeof entry === "string"
        )
      : [],
  };
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
        const extension = href
          .split(/[?#]/, 1)[0]
          ?.split(".")
          .pop()
          ?.toLowerCase();
        const typeAttribute = extension
          ? PRELOAD_MIME_TYPE_BY_EXTENSION[extension]
          : undefined;

        return `<link rel="preload" href="${normalizeAssetPath(href, relativePrefixToRoot)}" as="font"${
          typeAttribute ? ` type="${typeAttribute}"` : ""
        } crossorigin="anonymous">`;
      })
      .join("\n") + "\n"
  );
};
