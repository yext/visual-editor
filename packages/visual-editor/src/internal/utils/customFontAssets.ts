import { migrateThemeData } from "../../components/migrations/themeDataLabels.ts";
import {
  type FontRegistry,
  type Font,
  type FontVariant,
  getFontFamilyFromThemeValue,
  normalizeAssetPath,
} from "../../utils/fonts/visualEditorFonts.ts";
import { ThemeData } from "../../types/themeData.ts";

/**
 * Custom font asset flow:
 * 1. Normalize saved data at the migration boundary.
 * 2. Find each custom font family referenced by typography and action entries.
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
 * the current theme entries.
 */
export const buildCustomFontAssets = ({
  themeValues,
  customFonts,
}: {
  themeValues: Record<string, any>;
  customFonts: FontRegistry;
}): CustomFontAssets => {
  const theme = migrateThemeData(themeValues);
  const stylesheetPaths = new Set<string>();
  const preloads = new Set<string>();
  for (const entry of [...theme.typography, ...theme.actions]) {
    const family = getFontFamilyFromThemeValue(entry.fontFamily, {});
    const font = customFonts[family];
    if (!font) {
      continue;
    }
    if (font.facePath) {
      stylesheetPaths.add(font.facePath);
    }
    const weights =
      "presentation" in entry
        ? [
            entry.default.fontWeight,
            entry.hover.fontWeight,
            entry.active.fontWeight,
          ]
        : [entry.fontWeight];
    for (const weight of weights) {
      const variant = findMatchingVariant(
        font,
        entry.fontStyle,
        Number(weight)
      );
      if (variant) {
        preloads.add(variant.filePath);
      }
    }
  }
  return { stylesheetPaths: [...stylesheetPaths], preloads: [...preloads] };
};

/**
 * Resolves and writes custom font assets into theme data, or removes the key
 * entirely when no custom font assets are needed.
 */
export const updateThemeWithCustomFontAssets = ({
  themeValues,
  customFonts,
}: {
  themeValues: Record<string, any>;
  customFonts?: FontRegistry;
}): ThemeData => {
  themeValues = migrateThemeData(themeValues);
  if (!customFonts || Object.keys(customFonts).length === 0) {
    if (!(CUSTOM_FONT_ASSETS_KEY in themeValues)) {
      return themeValues as ThemeData;
    }

    const rest = { ...themeValues };
    delete rest[CUSTOM_FONT_ASSETS_KEY];
    return rest as ThemeData;
  }

  const customFontAssets = buildCustomFontAssets({
    themeValues,
    customFonts,
  });

  return {
    ...themeValues,
    [CUSTOM_FONT_ASSETS_KEY]: customFontAssets,
  } as ThemeData;
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
