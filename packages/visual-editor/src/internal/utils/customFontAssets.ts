import { Data } from "@puckeditor/core";
import {
  type FontRegistry,
  type Font,
  type FontVariant,
  getFontFamilyFromThemeValue,
  extractFontFamiliesFromLayout,
  normalizeAssetPath,
} from "../../utils/fonts/visualEditorFonts.ts";
import { ThemeConfig } from "../../utils/themeResolver.ts";
import { ThemeData } from "../types/themeData.ts";
import { generateCssVariablesFromThemeConfig } from "./internalThemeResolver.ts";

/**
 * Custom font asset flow:
 * 1. Merge default theme values with the current edited theme values.
 * 2. Find each custom font family referenced by the merged theme font-family variables.
 * 3. Collect the matching stylesheet paths for loading.
 * 4. Match each referenced family's style/weight selection to a variant `filePath` for preloading.
 * 5. Save those resolved asset lists back into theme data for runtime use.
 */
export const CUSTOM_FONT_ASSETS_KEY = "__customFontAssets";

export type CustomFontAssets = {
  stylesheetPaths: string[];
  preloads: string[];
};

type LayoutRootProps = NonNullable<NonNullable<Data["root"]>["props"]>;
type LayoutRootPropsWithCustomFontAssets = LayoutRootProps &
  Partial<Record<typeof CUSTOM_FONT_ASSETS_KEY, CustomFontAssets>>;

const PRELOAD_MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
};

const getMergedThemeValues = (
  themeConfig: ThemeConfig,
  themeValues: ThemeData
): ThemeData => ({
  ...generateCssVariablesFromThemeConfig(themeConfig),
  ...themeValues,
});

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
  themeConfig,
  themeValues,
  customFonts,
}: {
  themeConfig: ThemeConfig;
  themeValues: ThemeData;
  customFonts: FontRegistry;
}): CustomFontAssets => {
  const mergedThemeValues = getMergedThemeValues(themeConfig, themeValues);
  const stylesheetPaths = new Set<string>();
  const preloads = new Set<string>();

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
      mergedThemeValues[`--fontWeight-${sectionKey}-fontWeight`];
    const weight = Number.parseInt(String(weightValue), 10);
    if (Number.isNaN(weight)) {
      return;
    }

    const fontStyleValue =
      mergedThemeValues[`--fontStyle-${sectionKey}-fontStyle`];
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
  themeConfig,
  themeValues,
  customFonts,
}: {
  themeConfig: ThemeConfig;
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
    themeConfig,
    themeValues,
    customFonts,
  });

  return {
    ...themeValues,
    [CUSTOM_FONT_ASSETS_KEY]: customFontAssets,
  };
};

/**
 * updateLayoutWithCustomFontAssets scans the layout for custom fonts
 * and adds the asset information for any fonts that are found to data.root.props.
 */
export const updateLayoutWithCustomFontAssets = ({
  layoutData,
  customFonts,
}: {
  layoutData: Data;
  customFonts?: FontRegistry;
}): Data => {
  const rootProps: LayoutRootPropsWithCustomFontAssets = {
    ...layoutData.root?.props,
  };

  if (!customFonts || Object.keys(customFonts).length === 0) {
    if (!(CUSTOM_FONT_ASSETS_KEY in rootProps)) {
      return layoutData;
    }

    const nextRootProps: LayoutRootPropsWithCustomFontAssets = {
      ...rootProps,
    };
    delete nextRootProps[CUSTOM_FONT_ASSETS_KEY];
    const nextLayoutData: Data = {
      ...layoutData,
      root: {
        ...layoutData.root,
        props: nextRootProps,
      },
    };

    return nextLayoutData;
  }

  const stylesheetPaths = new Set<string>();

  for (const fontFamily of extractFontFamiliesFromLayout(layoutData)) {
    const customFont = customFonts[fontFamily];
    if (customFont?.facePath) {
      stylesheetPaths.add(customFont.facePath);
    }
  }

  const customFontAssets: CustomFontAssets = {
    stylesheetPaths: [...stylesheetPaths],
    preloads: [],
  };
  const nextRootProps: LayoutRootPropsWithCustomFontAssets = {
    ...rootProps,
    [CUSTOM_FONT_ASSETS_KEY]: customFontAssets,
  };
  const nextLayoutData: Data = {
    ...layoutData,
    root: {
      ...layoutData.root,
      props: nextRootProps,
    },
  };

  return nextLayoutData;
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

export const readCustomFontAssets = (value: unknown): CustomFontAssets => {
  if (!value || typeof value !== "object") {
    return {
      stylesheetPaths: [],
      preloads: [],
    };
  }

  const { stylesheetPaths, preloads } = value as Partial<CustomFontAssets>;

  return {
    stylesheetPaths: Array.isArray(stylesheetPaths)
      ? stylesheetPaths.filter(
          (entry): entry is string => typeof entry === "string"
        )
      : [],
    preloads: Array.isArray(preloads)
      ? preloads.filter((entry): entry is string => typeof entry === "string")
      : [],
  };
};
