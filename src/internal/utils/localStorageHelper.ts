import { Role } from "../../components/Editor.tsx";

const ROLE = "ROLE_",
  TEMPLATE = "TEMPLATE_",
  LAYOUT = "LAYOUT_",
  ENTITY = "ENTITY_";

export function getLocalStorageKey(
  isThemeMode: boolean,
  isDevMode: boolean,
  role: string,
  templateId: string,
  layoutId?: number,
  entityId?: number
) {
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
