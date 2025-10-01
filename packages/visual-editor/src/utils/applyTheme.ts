import { ThemeData } from "../internal/types/themeData.ts";
import {
  internalThemeResolver,
  generateCssVariablesFromThemeConfig,
} from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import {
  constructGoogleFontLinkTags,
  defaultFonts,
  extractInUseFontFamilies,
} from "./visualEditorFonts.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { hexToHSL } from "./colors.ts";

// Test PR for fonts

export type StreamDocument = {
  [key: string]: any;
  locale?: string;
  meta?: {
    locale?: string;
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
  let fontLinkTags: string;
  if (!overrides) {
    // No theme overrides, use only Open Sans (the default font)
    fontLinkTags = constructGoogleFontLinkTags({
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
      fontLinkTags = constructGoogleFontLinkTags({
        "Open Sans": defaultFonts["Open Sans"],
      });
    } else {
      fontLinkTags = constructGoogleFontLinkTags(inUseFonts);
    }
  }

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
    ...mergedThemeValues,
    ...generateContrastingColors(mergedThemeValues),
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
    if (cssVariableName.includes("--colors")) {
      const hsl = hexToHSL(value);
      if (hsl && hsl[2] >= 50) {
        contrastingColors[cssVariableName + "-contrast"] = "#000000";
      } else if (hsl) {
        contrastingColors[cssVariableName + "-contrast"] = "#FFFFFF";
      }
    }
  });
  return contrastingColors;
};

// Helper function to update font links in the editor document
const updateFontLinksInEditor = (fontLinkTags: string) => {
  const existingLinks = window.document.querySelectorAll(
    'link[href*="fonts.googleapis.com"]'
  );
  existingLinks.forEach((link) => link.remove());

  if (fontLinkTags) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = fontLinkTags;
    const links = tempDiv.querySelectorAll("link");
    links.forEach((link) => {
      window.document.head.appendChild(link);
    });
  }
};

const updateFontLinksInIframe = (
  iframe: HTMLIFrameElement,
  fontLinkTags: string
) => {
  if (!iframe.contentDocument) {
    return;
  }

  const existingLinks = iframe.contentDocument.querySelectorAll(
    'link[href*="fonts.googleapis.com"]'
  );
  existingLinks.forEach((link) => link.remove());
  if (fontLinkTags) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = fontLinkTags;
    const links = tempDiv.querySelectorAll("link");
    links.forEach((link) => {
      iframe.contentDocument!.head.appendChild(link);
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

  let fontLinkTags: string;
  if (Object.keys(inUseFonts).length === 0) {
    fontLinkTags = constructGoogleFontLinkTags({
      "Open Sans": defaultFonts["Open Sans"],
    });
  } else {
    fontLinkTags = constructGoogleFontLinkTags(inUseFonts);
  }

  const newThemeTag = internalApplyTheme(newTheme, themeConfig);
  const editorStyleTag = window.document.getElementById(THEME_STYLE_TAG_ID);
  if (editorStyleTag) {
    editorStyleTag.innerText = newThemeTag;
  }

  updateFontLinksInEditor(fontLinkTags);

  const observer = new MutationObserver(() => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const pagePreviewStyleTag =
      iframe?.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (pagePreviewStyleTag) {
      observer.disconnect();
      pagePreviewStyleTag.innerText = newThemeTag;
      updateFontLinksInIframe(iframe, fontLinkTags);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};
