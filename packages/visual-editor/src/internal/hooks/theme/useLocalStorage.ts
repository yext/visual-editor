import { useCallback } from "react";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import { DevLogger } from "../../../utils/devLogger.ts";

const SITE = "SITE_",
  THEME = "THEME_";

const devLogger = new DevLogger();

/**
 * useThemeLocalStorage contains helper functions for reading and clearing local storage
 * @param templateMetadata The template metadata for the active template (undefined if not loaded)
 */
export const useThemeLocalStorage = (
  templateMetadata: TemplateMetadata | undefined
) => {
  const buildThemeLocalStorageKey = useCallback(() => {
    if (!templateMetadata?.themeEntityId) {
      return "";
    }

    return getThemeLocalStorageKey(
      templateMetadata.isDevMode,
      templateMetadata.siteId,
      templateMetadata.themeEntityId
    );
  }, [templateMetadata]);

  /**
   * Clears the user's theming in localStorage
   */
  const clearThemeLocalStorage = () => {
    devLogger.logFunc("clearThemeLocalStorage");
    window.localStorage.removeItem(buildThemeLocalStorageKey());
  };

  return {
    clearThemeLocalStorage,
    buildThemeLocalStorageKey,
  };
};

function getThemeLocalStorageKey(
  isDevMode: boolean,
  siteId: number,
  themeId?: number
): string {
  if (!themeId) {
    throw new Error(
      "Unable to generate local storage key for themes, missing themeId"
    );
  }
  return (isDevMode ? "dev" : "") + SITE + siteId + THEME + themeId;
}
