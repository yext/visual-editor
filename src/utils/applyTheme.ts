import { ThemeData } from "../internal/types/themeData.ts";
import { internalThemeResolver } from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import { googleFontLinkTags } from "./visualEditorFonts.ts";
import { ThemeConfig } from "./themeResolver.ts";

export type Document = {
  [key: string]: any;
  __?: {
    layout?: string;
    theme?: string;
    codeTemplate?: string;
    name?: string;
  };
};

export const THEME_STYLE_TAG_ID = "visual-editor-theme";
export const PUCK_PREVIEW_IFRAME_ID = "preview-frame";
const devLogger = new DevLogger();

export const applyTheme = (
  document: Document,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  devLogger.logFunc("applyTheme");

  const publishedTheme = document?.__?.theme;
  const overrides = publishedTheme ? JSON.parse(publishedTheme) : undefined;

  if (Object.keys(themeConfig).length > 0) {
    return `${base ?? ""}${googleFontLinkTags}<style id="${THEME_STYLE_TAG_ID}" type="text/css">${internalApplyTheme(overrides, themeConfig)}</style>`;
  }
  return base ?? "";
};

const internalApplyTheme = (
  savedThemeValues: ThemeData,
  themeConfig: ThemeConfig
): string => {
  devLogger.logFunc("internalApplyTheme");

  const themeValuesToApply = internalThemeResolver(
    themeConfig,
    savedThemeValues
  );

  if (!themeValuesToApply || Object.keys(themeValuesToApply).length === 0) {
    return "";
  }
  devLogger.logData("THEME_VALUES_TO_APPLY", themeValuesToApply);

  return (
    `.components{` +
    Object.entries(themeValuesToApply)
      .map(([key, value]) => `${key}:${value} !important`)
      .join(";") +
    "}"
  );
};

export const updateThemeInEditor = async (
  newTheme: ThemeData,
  themeConfig: ThemeConfig
) => {
  devLogger.logFunc("updateThemeInEditor");

  const observer = new MutationObserver(() => {
    const iframe = document.getElementById(
      PUCK_PREVIEW_IFRAME_ID
    ) as HTMLIFrameElement;
    const styleTag = iframe.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (styleTag) {
      observer.disconnect();
      styleTag.innerText = internalApplyTheme(newTheme, themeConfig);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
  });
};
