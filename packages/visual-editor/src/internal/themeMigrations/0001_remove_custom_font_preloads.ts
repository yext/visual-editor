import { ThemeData } from "../types/themeData.ts";
import type { ThemeMigration } from "../../utils/migrateTheme.ts";
import { updateThemeWithCustomFontAssets } from "../utils/customFontAssets.ts";

const LEGACY_CUSTOM_FONT_PRELOADS_KEY = "__customFontPreloads";

/**
 * Replaces the legacy custom font preload field with generated custom font
 * assets derived from the current theme values.
 */
export const removeCustomFontPreloadsMigration: ThemeMigration = (
  themeValues: ThemeData,
  { customFonts, themeConfig }
): ThemeData => {
  const migratedThemeValues = { ...themeValues };
  delete migratedThemeValues[LEGACY_CUSTOM_FONT_PRELOADS_KEY];

  if (!themeConfig || !customFonts || Object.keys(customFonts).length === 0) {
    return migratedThemeValues;
  }

  return updateThemeWithCustomFontAssets({
    themeConfig,
    themeValues: migratedThemeValues,
    customFonts,
  });
};
