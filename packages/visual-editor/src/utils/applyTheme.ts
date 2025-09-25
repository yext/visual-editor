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
import { googleFontLinkTags } from "./visualEditorFonts";

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
  console.log(
    "🔴 applyTheme called with document:",
    document?.__?.theme ? "HAS THEME" : "NO THEME"
  );

  // Debug: create visible indicator
  if (typeof window !== "undefined" && window.document) {
    const debugDiv = window.document.createElement("div");
    debugDiv.style.cssText =
      "position:fixed;top:10px;left:10px;background:red;color:white;padding:10px;z-index:9999;";
    debugDiv.innerHTML = "applyTheme called";
    window.document.body?.appendChild(debugDiv);
  }

  devLogger.logFunc("applyTheme");

  const publishedTheme = document?.__?.theme;

  // Debug: check if we have theme data
  if (typeof window !== "undefined" && window.document) {
    const debugDiv2 = window.document.createElement("div");
    debugDiv2.style.cssText =
      "position:fixed;top:50px;left:10px;background:blue;color:white;padding:10px;z-index:9999;";
    debugDiv2.innerHTML = `publishedTheme: ${publishedTheme ? "EXISTS" : "NULL"}`;
    window.document.body?.appendChild(debugDiv2);
  }

  let overrides: ThemeData | undefined;

  if (publishedTheme) {
    try {
      overrides = JSON.parse(publishedTheme);

      // Debug: show parsed data
      if (typeof window !== "undefined" && window.document) {
        const debugDiv3 = window.document.createElement("div");
        debugDiv3.style.cssText =
          "position:fixed;top:90px;left:10px;background:green;color:white;padding:10px;z-index:9999;";
        debugDiv3.innerHTML = `Parsed: ${Object.keys(overrides || {}).length} keys`;
        window.document.body?.appendChild(debugDiv3);
      }

      devLogger.logData("THEME_DATA", overrides);
    } catch (error) {
      console.warn("Failed to parse published theme data:", error);
    }
  }

  // Load only fonts that are actually used in the theme
  let fontLinkTags: string;
  if (!overrides) {
    fontLinkTags = googleFontLinkTags;
    devLogger.logData("THEME_DATA", {
      usingAllFonts: true,
      reason: !publishedTheme ? "no_published_theme" : "theme_parse_failed",
    });
  } else {
    // Extract fonts from both published theme data AND default theme values
    // This ensures we get all fonts that are actually used, not just the ones that were explicitly changed
    const defaultThemeValues = generateCssVariablesFromThemeConfig(themeConfig);
    const mergedThemeData = { ...defaultThemeValues, ...overrides };

    const inUseFonts = extractInUseFontFamilies(mergedThemeData, defaultFonts);

    // Debug: show extracted fonts
    if (typeof window !== "undefined" && window.document) {
      const debugDiv4 = window.document.createElement("div");
      debugDiv4.style.cssText =
        "position:fixed;top:120px;left:10px;background:blue;color:white;padding:10px;z-index:9999;";
      debugDiv4.innerHTML = `Extracted: ${Object.keys(inUseFonts).join(", ")}`;
      window.document.body?.appendChild(debugDiv4);
    }

    devLogger.logData("THEME_DATA", {
      extractedFonts: inUseFonts,
      fontCount: Object.keys(inUseFonts).length,
      themeKeys: Object.keys(overrides).filter((key) =>
        key.includes("fontFamily")
      ),
      defaultThemeKeys: Object.keys(defaultThemeValues).filter((key) =>
        key.includes("fontFamily")
      ),
      mergedThemeKeys: Object.keys(mergedThemeData).filter((key) =>
        key.includes("fontFamily")
      ),
    });

    if (Object.keys(inUseFonts).length === 0) {
      fontLinkTags = googleFontLinkTags;
      devLogger.logData("THEME_DATA", {
        usingAllFonts: true,
        reason: "no_fonts_extracted_from_theme",
      });
    } else {
      fontLinkTags = constructGoogleFontLinkTags(inUseFonts);

      // Debug: show Google Fonts URL
      if (typeof window !== "undefined" && window.document) {
        const debugDiv5 = window.document.createElement("div");
        debugDiv5.style.cssText =
          "position:fixed;top:150px;left:10px;background:purple;color:white;padding:10px;z-index:9999;max-width:400px;word-break:break-all;";
        debugDiv5.innerHTML = `Font URL: ${fontLinkTags.substring(0, 200)}...`;
        window.document.body?.appendChild(debugDiv5);
      }
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
      iframe?.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
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
