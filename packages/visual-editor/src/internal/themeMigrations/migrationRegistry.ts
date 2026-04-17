import type { ThemeMigrationRegistry } from "../../utils/migrateTheme.ts";
import { removeCustomFontPreloadsMigration } from "./0001_remove_custom_font_preloads.ts";

export const themeMigrationRegistry: ThemeMigrationRegistry = [
  removeCustomFontPreloadsMigration,
];
