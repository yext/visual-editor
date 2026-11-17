import { migrateThemeData as migrateLegacyThemeData } from "./themeData.ts";
import { defaultThemeData } from "../../utils/defaultThemeData.ts";
import type { ThemeData } from "../../types/themeData.ts";

export * from "./themeData.ts";

/** Rename only generated default labels, preserving names authored by users. */
export const migrateThemeData = (input: unknown = {}): ThemeData => {
  const theme = migrateLegacyThemeData(input);
  for (const collection of ["colors", "typography", "actions"] as const) {
    for (const entry of theme[collection]) {
      const label = defaultThemeData[collection].find(
        (preset) => preset.id === entry.id
      )?.label;
      if (!label) continue;
      const words = (value: string) =>
        value.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
      if (words(entry.label) === words(label)) entry.label = label;
    }
  }
  return theme;
};

/** Apply current theme migrations to every undo/redo entry. */
export const migrateThemeHistories = <T extends { data: unknown }>(
  histories: T[]
): (Omit<T, "data"> & { data: ThemeData })[] =>
  histories.map((entry) => ({ ...entry, data: migrateThemeData(entry.data) }));
