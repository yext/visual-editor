import { useCallback } from "react";
import { TemplateMetadata } from "../../types/templateMetadata.ts";
import { DevLogger } from "../../../utils/devLogger.ts";

const Roles = {
  GLOBAL: "global",
  INDIVIDUAL: "individual",
};

const ROLE = "ROLE_",
  TEMPLATE = "TEMPLATE_",
  LAYOUT = "LAYOUT_",
  ENTITY = "ENTITY_";

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
      templateMetadata.role,
      templateMetadata.templateId,
      templateMetadata.layoutId,
      templateMetadata.entityId
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
  role: string,
  templateId: string,
  layoutId?: number,
  entityId?: number
): string {
  const devPrefix = isDevMode ? "dev" : "";
  if (!role || !templateId || (!entityId && !layoutId)) {
    throw new Error(
      `Unable to generate local storage key, missing query parameters${!entityId && " entityId"}${!layoutId && " layoutId"}`
    );
  }
  if (role === Roles.INDIVIDUAL) {
    if (!entityId) {
      throw new Error(`EntityId required for role ${role}`);
    }
    return devPrefix + ROLE + role + TEMPLATE + templateId + ENTITY + entityId;
  }

  if (!layoutId) {
    throw new Error(`LayoutId required for role ${role}`);
  }
  return devPrefix + ROLE + role + TEMPLATE + templateId + LAYOUT + layoutId;
}
