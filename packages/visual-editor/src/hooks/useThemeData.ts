import { useContext, useMemo, useSyncExternalStore } from "react";
import { TemplatePropsContext } from "./useDocument.tsx";
import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import { defaultThemeData } from "../utils/defaultThemeData.ts";

export const THEME_DATA_TAG_ID = "visual-editor-theme-data";
export const THEME_CHANGE_EVENT = "visual-editor-theme-change";

const subscribe = (listener: () => void) => {
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
};

/** The document owns the live payload, so separate previews cannot share state. */
export const useThemeData = () => {
  const template = useContext(TemplatePropsContext);
  const published = template?.document?.__?.theme ?? "";
  const serialized = useSyncExternalStore(
    subscribe,
    () => document.getElementById(THEME_DATA_TAG_ID)?.textContent ?? published,
    () => published
  );
  return useMemo(() => {
    if (!serialized) {
      return defaultThemeData;
    }
    const parsed = JSON.parse(serialized);
    return migrateThemeData(parsed);
  }, [serialized]);
};
