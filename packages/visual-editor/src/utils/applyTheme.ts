import themeCss from "../internal/theme/theme.css?raw";
import { ThemeData } from "../internal/types/themeData.ts";
import { themeValuesToCss } from "../internal/utils/internalThemeResolver.ts";
import { themeFields } from "../internal/theme/themeFields.ts";
import { DevLogger } from "./devLogger.ts";
import { legacyThemeVariables } from "../internal/theme/legacyTheme.ts";
import {
  resolveThemeFonts,
  createFontLinkElements,
  generateGoogleFontLinkData,
  fontLinkDataToHTML,
  generateCustomFontLinkData,
  type FontRegistry,
} from "./fonts/visualEditorFonts.ts";
import {
  buildFontPreloadTags,
  getCustomFontAssets,
} from "../internal/utils/customFontAssets.ts";
import fontFallbackTransformations from "./fonts/fontFallbackTransformations.json" with { type: "json" };
import { StreamDocument } from "./types/StreamDocument.ts";

export const THEME_STYLE_TAG_ID = "visual-editor-theme";
export const PUCK_PREVIEW_IFRAME_ID = "preview-frame";
const devLogger = new DevLogger();

export const internalApplyTheme = (values: ThemeData = {}): string => {
  const declarations = { ...legacyThemeVariables, ...themeValuesToCss(values) };
  return `:root{${Object.entries(declarations)
    .map(([key, value]) => `${key}:${value} !important`)
    .join(";")}}\n${themeCss}`;
};

export const applyTheme = (
  document: StreamDocument,
  relativePrefixToRoot: string,
  base?: string
): string => {
  let values: ThemeData = {};
  try {
    const parsed = JSON.parse(document?.__?.theme ?? "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      values = parsed;
    }
  } catch (error) {
    console.warn("Failed to parse published theme data:", error);
  }
  const { googleFonts } = resolveThemeFonts(values);
  // Old metadata must not load assets when the theme contains no new font selections.
  const hasNewFonts = Object.entries(themeFields).some(
    ([fieldKey, field]) =>
      field.type === "fontFamily" &&
      typeof values[fieldKey] === "string" &&
      values[fieldKey] !== ""
  );
  const assets = getCustomFontAssets(hasNewFonts ? values : undefined);
  const links = [
    ...generateCustomFontLinkData(assets.stylesheetPaths, relativePrefixToRoot),
    ...generateGoogleFontLinkData(googleFonts),
  ];
  const fallbacks = Object.keys(googleFonts).flatMap(
    (family) =>
      (fontFallbackTransformations as Record<string, string[]>)[family] ?? []
  );
  return `${base ?? ""}${buildFontPreloadTags(assets.preloads, relativePrefixToRoot)}${fontLinkDataToHTML(links)}<style type="text/css">${fallbacks.join("\n")}</style><style id="${THEME_STYLE_TAG_ID}" type="text/css">${internalApplyTheme(values)}</style>`;
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
    const links = createFontLinkElements(fonts, customFonts);
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
  isThemeMode: boolean,
  customFonts: FontRegistry = {}
) => {
  devLogger.logFunc("updateThemeInEditor");
  pendingObserver?.disconnect();

  const { googleFonts: googleFontsToLoad, customFonts: inUseCustomFonts } =
    resolveThemeFonts(newTheme, customFonts);

  const newThemeTag = internalApplyTheme(newTheme);
  getOrCreateThemeStyleTag(window.document).textContent = newThemeTag;

  // The theme editor loads its parent fonts separately.
  if (!isThemeMode) {
    updateFontLinksInDocument(
      window.document,
      googleFontsToLoad,
      inUseCustomFonts
    );
  }

  const syncIframeTheme = () => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const iframeDocument = iframe?.contentDocument;
    const pagePreviewStyleTag =
      iframeDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (!iframeDocument || !pagePreviewStyleTag) {
      return false;
    }

    pagePreviewStyleTag.textContent = newThemeTag;
    updateFontLinksInDocument(
      iframeDocument,
      googleFontsToLoad,
      inUseCustomFonts
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
