import { Data } from "@puckeditor/core";
import { ThemeData } from "../internal/types/themeData.ts";
import {
  internalThemeResolver,
  generateCssVariablesFromThemeConfig,
} from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import {
  defaultFonts,
  filterFontRegistries,
  createFontLinkElements,
  generateGoogleFontLinkData,
  fontLinkDataToHTML,
  type FontRegistry,
  type FontLinkData,
  generateCustomFontLinkData,
  extractFontFamiliesFromLayout,
  extractFontFamiliesFromTheme,
} from "./fonts/visualEditorFonts.ts";
import {
  buildFontPreloadTags,
  CUSTOM_FONT_ASSETS_KEY,
  readCustomFontAssets,
  type CustomFontAssets,
} from "../internal/utils/customFontAssets.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { getContrastingColor } from "./colors.ts";
import fontFallbackTransformations from "./fonts/fontFallbackTransformations.json" with { type: "json" };
import { StreamDocument } from "./types/StreamDocument.ts";

export const THEME_STYLE_TAG_ID = "visual-editor-theme";
export const PUCK_PREVIEW_IFRAME_ID = "preview-frame";
const devLogger = new DevLogger();

const resolveFontsToLoad = (
  themeValues: ThemeData,
  themeConfig: ThemeConfig,
  customFonts: FontRegistry = {}
) => {
  const mergedThemeData = {
    ...generateCssVariablesFromThemeConfig(themeConfig),
    ...themeValues,
  };
  const { inUseGoogleFonts, inUseCustomFonts } = filterFontRegistries(
    extractFontFamiliesFromTheme(mergedThemeData),
    defaultFonts,
    customFonts
  );

  return {
    inUseGoogleFonts,
    inUseCustomFonts,
    googleFontsToLoad:
      Object.keys(inUseGoogleFonts).length === 0
        ? { "Open Sans": defaultFonts["Open Sans"] }
        : inUseGoogleFonts,
  };
};

export const applyTheme = (
  document: StreamDocument,
  relativePrefixToRoot: string,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  devLogger.logFunc("applyTheme");

  const publishedTheme = document?.__?.theme;
  const publishedLayout = document?.__?.layout;
  let themeData: ThemeData | undefined;
  let layoutData:
    | Data<any, { [CUSTOM_FONT_ASSETS_KEY]?: CustomFontAssets }>
    | undefined;

  if (publishedTheme) {
    try {
      themeData = JSON.parse(publishedTheme);

      devLogger.logData("THEME_DATA", themeData);
    } catch (error) {
      console.warn("Failed to parse published theme data:", error);
    }
  }

  if (publishedLayout) {
    try {
      layoutData = JSON.parse(publishedLayout);
    } catch (error) {
      console.warn("Failed to parse published layout data:", error);
    }
  }

  let fontLinkData: FontLinkData[];
  const fallbackFontFaceDefinitions: string[] = [];

  const themeCustomFontAssets = readCustomFontAssets(
    themeData?.[CUSTOM_FONT_ASSETS_KEY]
  );
  const layoutCustomFontAssets = readCustomFontAssets(
    layoutData?.root?.props?.[CUSTOM_FONT_ASSETS_KEY]
  );

  const themeFonts = themeData
    ? resolveFontsToLoad(themeData, themeConfig)
    : { inUseGoogleFonts: {} };

  const layoutFonts = filterFontRegistries(
    extractFontFamiliesFromLayout(layoutData),
    defaultFonts
  );

  const googleFontsToLoad =
    Object.keys(themeFonts.inUseGoogleFonts).length > 0 ||
    Object.keys(layoutFonts.inUseGoogleFonts).length > 0
      ? {
          ...themeFonts.inUseGoogleFonts,
          ...layoutFonts.inUseGoogleFonts,
        }
      : { "Open Sans": defaultFonts["Open Sans"] };

  fontLinkData = generateGoogleFontLinkData(googleFontsToLoad);
  fontLinkData = [
    ...generateCustomFontLinkData(
      [
        ...new Set([
          ...themeCustomFontAssets.stylesheetPaths,
          ...layoutCustomFontAssets.stylesheetPaths,
        ]),
      ],
      relativePrefixToRoot
    ),
    ...fontLinkData,
  ];

  // For each in-use Google Font, look up the corresponding fallback fonts and add to the head
  Object.keys(googleFontsToLoad).forEach((fontFamily) => {
    if (fontFamily in fontFallbackTransformations) {
      fallbackFontFaceDefinitions.push(
        (fontFallbackTransformations as Record<string, string[]>)[
          fontFamily
        ].join("\n")
      );
    }
  });

  const fontLinkTags = fontLinkDataToHTML(fontLinkData);

  if (Object.keys(themeConfig).length > 0) {
    const preloadTags = buildFontPreloadTags(
      themeCustomFontAssets.preloads,
      relativePrefixToRoot
    );

    return `${base ?? ""}${preloadTags}${fontLinkTags}<style type="text/css">${fallbackFontFaceDefinitions.join("\n")}</style><style id="${THEME_STYLE_TAG_ID}" type="text/css">${internalApplyTheme(themeData ?? {}, themeConfig)}</style>`;
  }
  return base ?? "";
};

const internalApplyTheme = (
  savedThemeValues: ThemeData,
  themeConfig: ThemeConfig
): string => {
  devLogger.logFunc("internalApplyTheme");

  const mergedThemeValues = internalThemeResolver(
    themeConfig,
    savedThemeValues
  );

  if (!mergedThemeValues || Object.keys(mergedThemeValues).length === 0) {
    return "";
  }

  const themeValuesToApply = {
    ...generateContrastingColors(mergedThemeValues),
    ...mergedThemeValues,
  };

  devLogger.logData("THEME_VALUES_TO_APPLY", themeValuesToApply);

  const cssVariables = Object.entries(themeValuesToApply)
    .filter(([key]) => key.startsWith("--"))
    .map(([key, value]) => `${key}:${value} !important`)
    .join(";");

  return `:root{${cssVariables}}`;
};

/**
 * generateContrastingColors computes whether each color is
 * light or dark and adds a corresponding -contrast value that
 * is either black (for light colors) or white (for dark colors)
 */
const generateContrastingColors = (themeData: ThemeData) => {
  const contrastingColors: Record<string, string> = {};
  Object.entries(themeData).forEach(([cssVariableName, value]) => {
    if (
      cssVariableName.includes("--colors") &&
      !themeData[cssVariableName + "-contrast"] &&
      value.startsWith("#") &&
      (value.length === 7 || value.length === 4)
    ) {
      const contrastColor = getContrastingColor(value, 12, 400);
      contrastingColors[cssVariableName + "-contrast"] = contrastColor;
    }
  });
  return contrastingColors;
};

// Helper function to update font links in a document
const updateFontLinksInDocument = (
  document: Document,
  fonts: FontRegistry,
  customFonts: FontRegistry
) => {
  // Remove only theme-specific font links, preserve default fonts
  const existingLinks = document.querySelectorAll(
    'link[href*="fonts.googleapis.com"]:not([data-visual-editor-font="true"]), link[href*="y-fonts"]:not([data-visual-editor-font="true"])'
  );
  existingLinks.forEach((link) => link.remove());

  if (Object.keys(fonts).length + Object.keys(customFonts).length > 0) {
    const links = createFontLinkElements(document, fonts, customFonts);
    links.forEach((link) => {
      document.head.appendChild(link);
    });
  }
};

const getOrCreateThemeStyleTag = (document: Document): HTMLStyleElement => {
  const existingStyleTag = document.getElementById(THEME_STYLE_TAG_ID);
  if (existingStyleTag instanceof HTMLStyleElement) {
    return existingStyleTag;
  }

  const styleTag = document.createElement("style");
  styleTag.id = THEME_STYLE_TAG_ID;
  styleTag.type = "text/css";
  document.head.appendChild(styleTag);
  return styleTag;
};

// Used to avoid creating multiple observers in updateThemeInEditor
let pendingObserver: MutationObserver | null = null;

export const updateThemeInEditor = async (
  newTheme: ThemeData,
  themeConfig: ThemeConfig,
  customFonts: FontRegistry = {},
  layoutData?: unknown
) => {
  devLogger.logFunc("updateThemeInEditor");
  pendingObserver?.disconnect();

  const themeFonts = resolveFontsToLoad(newTheme, themeConfig, customFonts);
  const layoutFonts = filterFontRegistries(
    extractFontFamiliesFromLayout(layoutData),
    defaultFonts,
    customFonts
  );

  const googleFontsToLoad =
    Object.keys(themeFonts.inUseGoogleFonts).length > 0 ||
    Object.keys(layoutFonts.inUseGoogleFonts).length > 0
      ? {
          ...themeFonts.inUseGoogleFonts,
          ...layoutFonts.inUseGoogleFonts,
        }
      : themeFonts.googleFontsToLoad;
  const customFontsToLoad = {
    ...themeFonts.inUseCustomFonts,
    ...layoutFonts.inUseCustomFonts,
  };

  const newThemeTag = internalApplyTheme(newTheme, themeConfig);
  getOrCreateThemeStyleTag(window.document).textContent = newThemeTag;
  updateFontLinksInDocument(
    window.document,
    googleFontsToLoad,
    customFontsToLoad
  );

  const syncIframeTheme = () => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const iframeDocument = iframe?.contentDocument;
    if (!iframeDocument) {
      return false;
    }

    getOrCreateThemeStyleTag(iframeDocument).textContent = newThemeTag;
    updateFontLinksInDocument(
      iframeDocument,
      googleFontsToLoad,
      customFontsToLoad
    );
    return true;
  };

  if (syncIframeTheme()) {
    pendingObserver = null;
    return;
  }

  const observer = new MutationObserver(() => {
    if (syncIframeTheme()) {
      observer.disconnect();
      pendingObserver = null;
    }
  });

  pendingObserver = observer;
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};
