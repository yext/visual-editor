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

const stripQuotes = (value: string) => value.trim().replace(/^['"]|['"]$/g, "");

const extractFontFamilyName = (value: string) => {
  const firstFont = value.split(",")[0];
  return stripQuotes(firstFont);
};

const extractFontFaceBlocks = (cssText: string) => {
  return cssText.match(/@font-face\s*{[^}]*}/gi) ?? [];
};

const extractFirstUrl = (srcValue: string) => {
  const match = srcValue.match(/url\(([^)]+)\)/i);
  if (!match) {
    return undefined;
  }
  return stripQuotes(match[1]);
};

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

const parseFontFaceBlock = (block: string) => {
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
  // Theme data does not track italic styles; only preload normal rules.
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

export const removeCustomFontPreloads = (themeValues: ThemeData) => {
  if (!(CUSTOM_FONT_PRELOADS_KEY in themeValues)) {
    return themeValues;
  }
  const { [CUSTOM_FONT_PRELOADS_KEY]: _, ...rest } = themeValues;
  console.log(_);
  return rest;
};

export const getCustomFontPreloads = (themeValues: ThemeData | undefined) => {
  if (!themeValues) {
    return [];
  }
  const preloads = themeValues[CUSTOM_FONT_PRELOADS_KEY];
  return Array.isArray(preloads) ? preloads.filter(Boolean) : [];
};
