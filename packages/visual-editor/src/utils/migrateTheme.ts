import { ThemeData } from "../internal/types/themeData.ts";
import { themeMigrationRegistry as commonThemeMigrationRegistry } from "../internal/themeMigrations/migrationRegistry.ts";

export const THEME_VERSION_KEY = "__themeVersion";

export type ThemeMigration = (themeValues: ThemeData) => ThemeData;

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
  migrationRegistry: ThemeMigrationRegistry = commonThemeMigrationRegistry
): ThemeData => {
  const version =
    typeof themeValues?.[THEME_VERSION_KEY] === "number"
      ? themeValues[THEME_VERSION_KEY]
      : 0;

  let migratedThemeValues = { ...themeValues };

  migrationRegistry
    .slice(version)
    .forEach(
      (migration) => (migratedThemeValues = migration(migratedThemeValues))
    );

  if (migrationRegistry.length === 0) {
    return migratedThemeValues;
  }

  return {
    ...migratedThemeValues,
    [THEME_VERSION_KEY]: migrationRegistry.length,
  };
};
