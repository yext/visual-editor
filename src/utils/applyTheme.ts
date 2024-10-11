import { internalThemeResolver } from "../internal/utils/internalThemeResolver.ts";
import { DevLogger } from "./devLogger.ts";
import { SavedTheme, ThemeConfig } from "./themeResolver.ts";

export type Document = {
  [key: string]: any;
};

const THEME_STYLE_TAG_ID = "visual-editor-theme";
const devLogger = new DevLogger();

export const applyTheme = (
  document: Document,
  themeConfig: ThemeConfig,
  base?: string
): string => {
  devLogger.logFunc("applyTheme");
  const savedThemes: Record<string, any>[] = document?._site?.pagesTheme;

  let savedTheme;
  if (savedThemes?.length > 0) {
    savedTheme =
      document.siteId !== 0
        ? savedThemes.find(
            (theme) =>
              Number(theme.themeConfiguration.siteId) === document.siteId
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
  devLogger.logFunc("internalApplyTheme");

  const themeValuesToApply = internalThemeResolver(
    themeConfig,
    savedThemeValues
  );
  devLogger.logData("THEME_VALUES_TO_APPLY", themeValuesToApply);

  if (!themeValuesToApply || Object.keys(themeValuesToApply).length === 0) {
    return base ?? "";
  }
  return (
    `${base ?? ""}<style id="${THEME_STYLE_TAG_ID}" type="text/css">.components{` +
    Object.entries(themeValuesToApply)
      .map(([key, value]) => `${key}:${value} !important`)
      .join(";") +
    "}</style>"
  );
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const updateThemeInEditor = async (
  newTheme: SavedTheme,
  themeConfig: ThemeConfig
) => {
  devLogger.logFunc("updateThemeInEditor");

  const previewFrame = document.getElementById(
    "preview-frame"
  ) as HTMLIFrameElement;

  let loopTries = 0;
  if (previewFrame && previewFrame.contentDocument) {
    devLogger.log("updateThemeInEditor: preview-frame found.");

    while (loopTries < 500) {
      const styleOverride =
        previewFrame?.contentDocument?.getElementById(THEME_STYLE_TAG_ID);

      if (styleOverride) {
        devLogger.log("updateThemeInEditor: preview-frame found.");
        styleOverride.outerHTML = internalApplyTheme(newTheme, themeConfig);
        return;
      }
      await delay(10);
      loopTries += 1;
    }
    devLogger.log("Could not find style override tag after 5 seconds");
  }
};
