import { useCallback } from "react";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import { DevLogger } from "../../../utils/devLogger.ts";

const TEMPLATE = "TEMPLATE_",
  LAYOUT = "LAYOUT_";

const devLogger = new DevLogger();

/**
 * useLayoutLocalStorage contains helper functions for reading and clearing local storage
 * @param templateMetadata The template metadata for the active template (undefined if not loaded)
 */
export const useLayoutLocalStorage = (
  templateMetadata: TemplateMetadata | undefined
) => {
  const buildVisualConfigLocalStorageKey = useCallback(() => {
    if (!templateMetadata) {
      return "";
    }

    return getVisualConfigLocalStorageKey(
      templateMetadata.isDevMode && !templateMetadata.devOverride,
      templateMetadata.templateId,
      templateMetadata.layoutId
    );
  }, [templateMetadata]);

  /**
   * Clears the user's visual configuration in localStorage and resets the current Puck history
   */
  const clearVisualConfigLocalStorage = () => {
    devLogger.logFunc("clearVisualConfigLocalStorage");
    window.localStorage.removeItem(buildVisualConfigLocalStorageKey());
  };

  return {
    clearVisualConfigLocalStorage,
    buildVisualConfigLocalStorageKey,
  };
};

function getVisualConfigLocalStorageKey(
  isDevMode: boolean,
  templateId: string,
  layoutId?: number
): string {
  const devPrefix = isDevMode ? "dev" : "";
  if (!templateId || !layoutId) {
    throw new Error(
      `Unable to generate local storage key, missing query parameters${!layoutId && " layoutId"}`
    );
  }

  let key = devPrefix + TEMPLATE + templateId;
  if (layoutId) {
    key += LAYOUT + layoutId;
  }

  return key;
}
