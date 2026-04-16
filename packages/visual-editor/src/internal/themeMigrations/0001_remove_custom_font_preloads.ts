import { ThemeData } from "../types/themeData.ts";
import type { ThemeMigration } from "../../utils/migrateTheme.ts";

const LEGACY_CUSTOM_FONT_PRELOADS_KEY = "__customFontPreloads";

/**
 * Removes the legacy custom font preload field from saved theme data.
 */
export const removeCustomFontPreloadsMigration: ThemeMigration = (
  themeValues: ThemeData
): ThemeData => {
  const migratedThemeValues = { ...themeValues };
  delete migratedThemeValues[LEGACY_CUSTOM_FONT_PRELOADS_KEY];
  return migratedThemeValues;
};
