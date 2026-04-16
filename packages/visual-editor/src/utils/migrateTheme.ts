import { ThemeData } from "../internal/types/themeData.ts";
import { migrationRegistry as commonMigrationRegistry } from "../internal/themeMigrations/migrationRegistry.ts";
import { FontRegistry } from "./fonts/visualEditorFonts.ts";
import { ThemeConfig } from "./themeResolver.ts";

export const THEME_VERSION_KEY = "__themeVersion";

export type ThemeMigrationContext = {
  customFonts?: FontRegistry;
  themeConfig?: ThemeConfig;
};

export type ThemeMigration = (
  themeValues: ThemeData,
  context: ThemeMigrationContext
) => ThemeData;

export type ThemeMigrationRegistry = ThemeMigration[];

/**
 * Applies all pending theme migrations to saved theme values.
 *
 * Steps:
 * 1. Read the current saved theme migration version from the theme payload.
 * 2. Run each missing migration in order so upgrades stay append-only.
 * 3. Stamp the latest version back onto the migrated theme data.
 */
export const migrateTheme = (
  themeValues: ThemeData,
  context: ThemeMigrationContext = {},
  migrationRegistry: ThemeMigrationRegistry = commonMigrationRegistry
): ThemeData => {
  const version =
    typeof themeValues?.[THEME_VERSION_KEY] === "number"
      ? themeValues[THEME_VERSION_KEY]
      : 0;

  let migratedThemeValues = { ...themeValues };
  const migrationsToApply = migrationRegistry.slice(version);

  if (migrationsToApply.length === 0) {
    return migratedThemeValues;
  }

  migrationsToApply.forEach(
    (migration) =>
      (migratedThemeValues = migration(migratedThemeValues, context))
  );

  return {
    ...migratedThemeValues,
    [THEME_VERSION_KEY]: migrationRegistry.length,
  };
};
