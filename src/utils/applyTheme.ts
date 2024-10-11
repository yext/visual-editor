import { internalThemeResolver } from "../internal/utils/internalThemeResolver.ts";
import { SavedTheme, ThemeConfig } from "./themeResolver.ts";

export type Document = {
  [key: string]: any;
};

const THEME_STYLE_TAG_ID = "visual-editor-theme";

export const applyTheme = (
  document: Document,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  const savedThemes: Record<string, any>[] = document?._site?.pagesTheme;

  let savedTheme;
  if (savedThemes?.length > 0) {
    savedTheme =
      document.siteId !== 0
        ? savedThemes.find(
            (theme) => theme.themeConfiguration.siteId === document.siteId
          )
        : savedThemes[0]; // siteId is not set on local data documents, so default to the first one
  }

  let overrides;
  if (savedTheme?.themeConfiguration) {
    overrides = JSON.parse(savedTheme.themeConfiguration?.data);
  }
  return internalApplyTheme(overrides, themeConfig, base);
};

const internalApplyTheme = (
  savedThemeValues: Record<string, any>,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  const themeValues = internalThemeResolver(themeConfig, savedThemeValues);

  if (!themeValues || Object.keys(themeValues).length === 0) {
    return base ?? "";
  }
  return (
    `${base ?? ""}<style id="${THEME_STYLE_TAG_ID}" type="text/css">.components{` +
    Object.entries(themeValues)
      .map(([key, value]) => `${key}:${value} !important`)
      .join(";") +
    "}</style>"
  );
};

export const updateThemeInEditor = (
  newTheme: SavedTheme,
  themeConfig: ThemeConfig
) => {
  const previewFrame = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement;
  if (previewFrame && previewFrame.contentDocument) {
    const styleOverride =
      previewFrame?.contentDocument?.getElementById(THEME_STYLE_TAG_ID);
    if (styleOverride) {
      styleOverride.outerHTML = internalApplyTheme(newTheme, themeConfig);
    }
  }
};
