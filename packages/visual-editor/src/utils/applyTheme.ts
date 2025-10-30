import { ThemeData } from "../internal/types/themeData.ts";
import {
  internalThemeResolver,
  generateCssVariablesFromThemeConfig,
} from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import {
  defaultFonts,
  extractInUseFontFamilies,
  createFontLinkElements,
  generateFontLinkData,
  fontLinkDataToHTML,
  type FontRegistry,
  type FontLinkData,
} from "./visualEditorFonts.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { getContrastingColor } from "./colors.ts";

export type StreamDocument = {
  [key: string]: any;
  locale?: string;
  meta?: {
    locale?: string;
    entityType?: {
      id?: string;
    };
  };
  __?: {
    layout?: string;
    theme?: string;
    codeTemplate?: string;
    name?: string;
    visualEditorConfig?: string;
    isPrimaryLocale?: boolean;
    entityPageSetUrlTemplates?: string;
  };
};

export const THEME_STYLE_TAG_ID = "visual-editor-theme";
export const PUCK_PREVIEW_IFRAME_ID = "preview-frame";
const devLogger = new DevLogger();

export const applyTheme = (
  document: StreamDocument,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  devLogger.logFunc("applyTheme");

  const publishedTheme = document?.__?.theme;

  let overrides: ThemeData | undefined;

  if (publishedTheme) {
    try {
      overrides = JSON.parse(publishedTheme);

      devLogger.logData("THEME_DATA", overrides);
    } catch (error) {
      console.warn("Failed to parse published theme data:", error);
    }
  }

  // Load only fonts that are actually used in the theme
  let fontLinkData: FontLinkData[];
  if (!overrides) {
    // No theme overrides, use only Open Sans (the default font)
    fontLinkData = generateFontLinkData({
      "Open Sans": defaultFonts["Open Sans"],
    });
  } else {
    // Extract fonts from both published theme data AND default theme values
    // This ensures we get all fonts that are actually used, not just the ones that were explicitly changed
    const defaultThemeValues = generateCssVariablesFromThemeConfig(themeConfig);
    const mergedThemeData = { ...defaultThemeValues, ...overrides };
    const inUseFonts = extractInUseFontFamilies(mergedThemeData, defaultFonts);

    if (Object.keys(inUseFonts).length === 0) {
      // No fonts found in theme data, use only Open Sans
      fontLinkData = generateFontLinkData({
        "Open Sans": defaultFonts["Open Sans"],
      });
    } else {
      fontLinkData = generateFontLinkData(inUseFonts);
    }
  }

  const fontLinkTags = fontLinkDataToHTML(fontLinkData);

  if (Object.keys(themeConfig).length > 0) {
    return `${base ?? ""}${fontLinkTags}<style id="${THEME_STYLE_TAG_ID}" type="text/css">${internalApplyTheme(overrides ?? {}, themeConfig)}</style>`;
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

  return (
    `.components{` +
    Object.entries(themeValuesToApply)
      .map(([key, value]) => `${key}:${value} !important`)
      .join(";") +
    "}"
  );
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
const updateFontLinksInDocument = (document: Document, fonts: FontRegistry) => {
  // Remove only theme-specific font links, preserve default fonts
  const existingLinks = document.querySelectorAll(
    'link[href*="fonts.googleapis.com"]:not([data-visual-editor-font="true"])'
  );
  existingLinks.forEach((link) => link.remove());

  if (Object.keys(fonts).length > 0) {
    const links = createFontLinkElements(fonts);
    links.forEach((link) => {
      document.head.appendChild(link);
    });
  }
};

export const updateThemeInEditor = async (
  newTheme: ThemeData,
  themeConfig: ThemeConfig
) => {
  devLogger.logFunc("updateThemeInEditor");

  const defaultThemeValues = generateCssVariablesFromThemeConfig(themeConfig);
  const mergedThemeData = { ...defaultThemeValues, ...newTheme };
  const inUseFonts = extractInUseFontFamilies(mergedThemeData, defaultFonts);

  let fontsToLoad: FontRegistry;
  if (Object.keys(inUseFonts).length === 0) {
    fontsToLoad = {
      "Open Sans": defaultFonts["Open Sans"],
    };
  } else {
    fontsToLoad = inUseFonts;
  }

  const newThemeTag = internalApplyTheme(newTheme, themeConfig);
  const editorStyleTag = window.document.getElementById(THEME_STYLE_TAG_ID);
  if (editorStyleTag) {
    editorStyleTag.innerText = newThemeTag;
  }

  updateFontLinksInDocument(window.document, fontsToLoad);

  const observer = new MutationObserver(() => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const pagePreviewStyleTag =
      iframe?.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (pagePreviewStyleTag) {
      observer.disconnect();
      pagePreviewStyleTag.innerText = newThemeTag;
      updateFontLinksInDocument(iframe.contentDocument!, fontsToLoad);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};
