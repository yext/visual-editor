import {
  FontRegistry,
  generateCustomFontLinkData,
} from "../../utils/fonts/visualEditorFonts.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";
import { generateCssVariablesFromThemeConfig } from "./internalThemeResolver.ts";

export const CUSTOM_FONT_PRELOADS_KEY = "__customFontPreloads";

type CustomFontFaceIndex = {
  variableSrc?: string;
  staticSrcByWeight: Record<number, string>;
};

export type CustomFontCssIndex = Record<string, CustomFontFaceIndex>;

/**
 * Removes wrapping single or double quotes from a string.
 */
const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, "");

/**
 * Extracts the first font-family name from a font-family declaration value.
 * For example, given "'Alpha', sans-serif", it returns "Alpha".
 */
const extractFontFamilyName = (value: string) => {
  const firstFont = value.split(",")[0];
  return stripQuotes(firstFont);
};

/**
 * Returns all @font-face blocks found in the css text.
 * For example:
 *   @font-face {
 *     font-family: 'Alpha';
 *     font-weight: 400;
 *     src: url('/y-fonts/alpha-400.woff2');
 *   }
 */
const extractFontFaceBlocks = (cssText: string) => {
  // Matches each "@font-face { ... }" block up to the first closing brace.
  return cssText.match(/@font-face\s*{[^}]*}/gi) ?? [];
};

/**
 * Extracts the first URL from a css src declaration.
 */
const extractFirstUrl = (srcValue: string) => {
  // Captures the first url(...) occurrence in srcValue
  const match = srcValue.match(/url\(([^)]+)\)/i);
  if (!match) {
    return undefined;
  }
  return stripQuotes(match[1]);
};

/**
 * Parses a font-weight value that can be a single number or a range.
 */
const parseFontWeight = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.includes(" ")) {
    const [min, max] = normalized.split(" ");
    const minWeight = Number.parseInt(min, 10);
    const maxWeight = Number.parseInt(max, 10);
    if (!Number.isNaN(minWeight) && !Number.isNaN(maxWeight)) {
      return { type: "range" as const, minWeight, maxWeight };
    }
  }

  const weight = Number.parseInt(normalized, 10);
  if (!Number.isNaN(weight)) {
    return { type: "single" as const, weight };
  }
  return undefined;
};

/**
 * Parses a single @font-face block into its family, weight, and file source.
 * For example, given the block:
 *   @font-face {
 *     font-family: 'Alpha';
 *     font-weight: 400;
 *     font-style: normal;
 *     src: url('/y-fonts/alpha-400.woff2');
 *   }
 * It returns:
 *   {
 *     fontFamily: "Alpha",
 *     weight: { type: "single", weight: 400 },
 *     src: "/y-fonts/alpha-400.woff2"
 *   }
 * It returns undefined if required properties are missing or if the style is not normal.
 */
const parseFontFaceBlock = (block: string) => {
  // Capture property values up to the semicolon (case-insensitive).
  const familyMatch = block.match(/font-family\s*:\s*([^;]+);/i);
  const weightMatch = block.match(/font-weight\s*:\s*([^;]+);/i);
  const styleMatch = block.match(/font-style\s*:\s*([^;]+);/i);
  const srcMatch = block.match(/src\s*:\s*([^;]+);/i);

  const fontFamilyRaw = familyMatch ? familyMatch[1] : undefined;
  const fontWeightRaw = weightMatch ? weightMatch[1] : undefined;
  const fontStyleRaw = styleMatch ? styleMatch[1] : "normal";
  const srcRaw = srcMatch ? srcMatch[1] : undefined;

  if (!fontFamilyRaw || !fontWeightRaw || !srcRaw) {
    return undefined;
  }

  const fontStyle = fontStyleRaw.trim().toLowerCase();
  // Theme data does not track italic styles; only preload normal font styles.
  if (fontStyle !== "normal") {
    return undefined;
  }

  const fontFamily = stripQuotes(fontFamilyRaw);
  const weight = parseFontWeight(fontWeightRaw);
  const src = extractFirstUrl(srcRaw);

  if (!fontFamily || !weight || !src) {
    return undefined;
  }

  return { fontFamily, weight, src };
};

/**
 * Builds an index of @font-face rules for custom fonts by fetching their css.
 */
export const loadCustomFontCssIndex = async (
  customFonts: FontRegistry
): Promise<CustomFontCssIndex> => {
  const index: CustomFontCssIndex = {};
  const customFontNames = Object.keys(customFonts);
  if (customFontNames.length === 0 || typeof window === "undefined") {
    return index;
  }

  const linkData = generateCustomFontLinkData(customFontNames, "./");
  const cssTexts = await Promise.all(
    linkData.map(async (link) => {
      try {
        const response = await fetch(link.href);
        if (!response.ok) {
          return "";
        }
        return await response.text();
      } catch {
        return "";
      }
    })
  );

  cssTexts.forEach((cssText) => {
    extractFontFaceBlocks(cssText).forEach((block) => {
      const parsed = parseFontFaceBlock(block);
      if (!parsed) {
        return;
      }

      const { fontFamily, weight, src } = parsed;
      if (!index[fontFamily]) {
        index[fontFamily] = { staticSrcByWeight: {} };
      }
      if (weight.type === "range") {
        index[fontFamily].variableSrc = src;
      } else {
        index[fontFamily].staticSrcByWeight[weight.weight] = src;
      }
    });
  });

  return index;
};

/**
 * Computes the list of custom font files to preload based on theme values.
 */
export const buildCustomFontPreloads = ({
  themeConfig,
  themeValues,
  customFonts,
  customFontCssIndex,
}: {
  themeConfig: ThemeConfig;
  themeValues: ThemeData;
  customFonts: FontRegistry;
  customFontCssIndex: CustomFontCssIndex;
}) => {
  const defaultThemeValues = generateCssVariablesFromThemeConfig(themeConfig);
  const mergedThemeValues = { ...defaultThemeValues, ...themeValues };
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
    if (!customFonts[fontFamily]) {
      return;
    }

    const weightValue =
      mergedThemeValues[`--fontWeight-${sectionKey}-fontWeight`];
    const weight = Number.parseInt(String(weightValue), 10);
    if (Number.isNaN(weight)) {
      return;
    }

    const index = customFontCssIndex[fontFamily];
    if (!index) {
      return;
    }

    const src = index.variableSrc ?? index.staticSrcByWeight[weight];
    if (!src || seen.has(src)) {
      return;
    }

    seen.add(src);
    preloads.push(src);
  });

  return preloads;
};

/**
 * Removes the custom font preloads key from theme data if present.
 */
export const removeCustomFontPreloads = (themeValues: ThemeData) => {
  if (!(CUSTOM_FONT_PRELOADS_KEY in themeValues)) {
    return themeValues;
  }
  // oxlint-disable-next-line no-unused-vars: ignore unused _
  const { [CUSTOM_FONT_PRELOADS_KEY]: _, ...rest } = themeValues;
  return rest;
};

/**
 * Returns the custom font preload list from theme data, if available.
 */
export const getCustomFontPreloads = (themeValues: ThemeData | undefined) => {
  if (!themeValues) {
    return [];
  }
  const preloads = themeValues[CUSTOM_FONT_PRELOADS_KEY];
  return Array.isArray(preloads) ? preloads.filter(Boolean) : [];
};
