import { internalThemeResolver } from "../internal/utils/internalThemeResolver.ts";
import { SavedTheme, ThemeConfig } from "./themeResolver.ts";

export type Document = {
  c_theme?: SavedTheme;
  [key: string]: any;
};

const THEME_STYLE_TAG_ID = "visual-editor-theme";

export const applyTheme = (
  document: Document,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  const overrides = document.c_theme;
  const themeValues = internalThemeResolver(themeConfig, overrides);

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
      styleOverride.outerHTML = applyTheme({ c_theme: newTheme }, themeConfig);
    }
  }
};
