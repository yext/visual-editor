import { ThemeData } from "../types/themeData.ts";
import { DevLogger } from "./devLogger.ts";
import {
  defaultFonts,
  filterInUseFontRegistries,
  createFontLinkElements,
  generateGoogleFontLinkData,
  fontLinkDataToHTML,
  type FontRegistry,
  generateCustomFontLinkData,
} from "./fonts/visualEditorFonts.ts";
import {
  buildFontPreloadTags,
  getCustomFontAssets,
} from "../internal/utils/customFontAssets.ts";

import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import fontFallbackTransformations from "./fonts/fontFallbackTransformations.json" with { type: "json" };
import { StreamDocument } from "./types/StreamDocument.ts";

import { buildThemeCss } from "./dynamicTheme.ts";
import {
  THEME_DATA_TAG_ID,
  THEME_CHANGE_EVENT,
} from "../hooks/useThemeData.ts";

export const THEME_STYLE_TAG_ID = "visual-editor-theme";
export const PUCK_PREVIEW_IFRAME_ID = "preview-frame";
const devLogger = new DevLogger();

const resolveFontsToLoad = (
  themeValues: ThemeData,
  customFonts: FontRegistry = {}
) => {
  const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
    themeValues,
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
  base?: string
): string => {
  devLogger.logFunc("applyTheme");

  let saved: unknown = {};
  if (document?.__?.theme) {
    try {
      saved = JSON.parse(document.__.theme);
    } catch (error) {
      console.warn("Failed to parse published theme data:", error);
    }
  }
  const theme = migrateThemeData(saved);
  const { inUseGoogleFonts, googleFontsToLoad } = resolveFontsToLoad(theme);
  const customFontAssets = getCustomFontAssets(theme);
  const fontLinkData = [
    ...generateCustomFontLinkData(
      customFontAssets.stylesheetPaths,
      relativePrefixToRoot
    ),
    ...generateGoogleFontLinkData(googleFontsToLoad),
  ];
  const fallbackFontFaces = Object.keys(inUseGoogleFonts)
    .flatMap(
      (family) =>
        (fontFallbackTransformations as Record<string, string[]>)[family] ?? []
    )
    .join("\n");
  const preloads = buildFontPreloadTags(
    customFontAssets.preloads,
    relativePrefixToRoot
  );
  const payload = JSON.stringify(theme).replaceAll("<", "\\u003c");
  return `${base ?? ""}${preloads}${fontLinkDataToHTML(fontLinkData)}<style type="text/css">${fallbackFontFaces}</style><style id="${THEME_STYLE_TAG_ID}" type="text/css">${buildThemeCss(theme)}</style><script id="${THEME_DATA_TAG_ID}" type="application/json">${payload}</script>`;
};

// Helper function to update font links in a document
const updateFontLinksInDocument = (
  document: Document,
  fonts: FontRegistry,
  customFonts: FontRegistry
) => {
  // Remove only theme-specific font links, preserve default fonts
  const existingLinks = document.querySelectorAll(
    '[data-visual-editor-theme-font="true"], link[href*="fonts.googleapis.com"]:not([data-visual-editor-font="true"]), link[href*="y-fonts"]:not([data-visual-editor-font="true"])'
  );
  existingLinks.forEach((link) => link.remove());

  if (Object.keys(fonts).length + Object.keys(customFonts).length > 0) {
    const links = createFontLinkElements(fonts, customFonts);
    links.forEach((link) => {
      link.setAttribute("data-visual-editor-theme-font", "true");
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
  newTheme: Record<string, any>,
  isThemeMode: boolean,
  customFonts: FontRegistry = {}
) => {
  const theme = migrateThemeData(newTheme);
  devLogger.logFunc("updateThemeInEditor");
  pendingObserver?.disconnect();

  const { inUseCustomFonts, googleFontsToLoad } = resolveFontsToLoad(
    theme,
    customFonts
  );

  const newThemeTag = buildThemeCss(theme);
  getOrCreateThemeStyleTag(window.document).textContent = newThemeTag;
  const syncThemeData = (targetDocument: Document) => {
    let tag = targetDocument.getElementById(THEME_DATA_TAG_ID);
    if (!tag) {
      const script = targetDocument.createElement("script");
      script.id = THEME_DATA_TAG_ID;
      script.type = "application/json";
      targetDocument.head.appendChild(script);
      tag = script;
    }
    tag.textContent = JSON.stringify(theme);
    targetDocument.defaultView?.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };
  syncThemeData(window.document);

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
    syncThemeData(iframeDocument);
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
