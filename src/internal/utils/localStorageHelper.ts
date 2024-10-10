import { Role } from "../../components/Editor.tsx";

const ROLE = "ROLE_",
  SITE = "SITE_",
  TEMPLATE = "TEMPLATE_",
  LAYOUT = "LAYOUT_",
  ENTITY = "ENTITY_",
  THEME = "THEME_";

export function getLocalStorageKey(
  isThemeMode: boolean,
  isDevMode: boolean,
  role: string,
  templateId: string,
  layoutId?: number,
  entityId?: number
): string {
  const devPrefix = isDevMode ? "dev" : "";
  if (!role || !templateId || (!entityId && !layoutId)) {
    throw new Error(
      "Unable to generate local storage key, missing query parameters"
    );
  }
  if (role === Role.INDIVIDUAL || isThemeMode) {
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

export function getThemeLocalStorageKey(
  isDevMode: boolean,
  siteId: number,
  themeEntityId?: number
): string {
  if (!themeEntityId) {
    throw new Error(
      "Unable to generate local storage key for themes, missing query parameters"
    );
  }
  return (isDevMode ? "dev" : "") + SITE + siteId + THEME + themeEntityId;
}
