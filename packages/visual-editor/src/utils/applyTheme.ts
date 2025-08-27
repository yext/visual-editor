import { ThemeData } from "../internal/types/themeData.ts";
import { internalThemeResolver } from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import {
  constructGoogleFontLinkTags,
  defaultFonts,
  extractInUseFontFamilies,
} from "./visualEditorFonts.ts";
import { ThemeConfig } from "./themeResolver.ts";
import { hexToHSL } from "./colors.ts";
import { googleFontLinkTags } from "./visualEditorFonts";

export type StreamDocument = {
  [key: string]: any;
  locale?: string;
  __?: {
    layout?: string;
    theme?: string;
    codeTemplate?: string;
    name?: string;
    visualEditorConfig?: string;
    isPrimaryLocale?: boolean;
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
  const overrides = publishedTheme ? JSON.parse(publishedTheme) : undefined;

  // In the editor with no published theme, inject all the google font tags, else only inject the in-use font tags
  const fontLinkTags = !publishedTheme
    ? googleFontLinkTags
    : constructGoogleFontLinkTags(
        extractInUseFontFamilies(overrides, defaultFonts)
      );

  if (Object.keys(themeConfig).length > 0) {
    return `${base ?? ""}${fontLinkTags}<style id="${THEME_STYLE_TAG_ID}" type="text/css">${internalApplyTheme(overrides, themeConfig)}</style>`;
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

export const updateThemeInEditor = async (
  newTheme: ThemeData,
  themeConfig: ThemeConfig
) => {
  devLogger.logFunc("updateThemeInEditor");

  const newThemeTag = internalApplyTheme(newTheme, themeConfig);
  const editorStyleTag = window.document.getElementById(THEME_STYLE_TAG_ID);
  if (editorStyleTag) {
    editorStyleTag.innerText = newThemeTag;
  }

  const observer = new MutationObserver(() => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const pagePreviewStyleTag =
      iframe.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (pagePreviewStyleTag) {
      observer.disconnect();
      pagePreviewStyleTag.innerText = newThemeTag;
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};
