import { Migration } from "../../utils/migrate.ts";

const stripPrefix = (value: unknown, prefix: string): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  if (!value) {
    return undefined;
  }

  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
};

const hasLegacyThemeColorKeys = (value: Record<string, unknown>): boolean => {
  const hasLegacyColorString =
    typeof value.bgColor === "string" || typeof value.textColor === "string";
  const hasLegacyDarkFlag = typeof value.isDarkBackground === "boolean";

  return hasLegacyColorString || hasLegacyDarkFlag;
};

const migrateLegacyThemeColor = (
  value: Record<string, unknown>
): Record<string, unknown> => {
  const migratedValue: Record<string, unknown> = { ...value };

  const selectedColor = stripPrefix(value.bgColor, "bg-");
  if (selectedColor !== undefined) {
    migratedValue.selectedColor = selectedColor;
  }

  const contrastingColor = stripPrefix(value.textColor, "text-");
  if (contrastingColor !== undefined) {
    migratedValue.contrastingColor = contrastingColor;
  }

  if (typeof value.isDarkBackground === "boolean") {
    migratedValue.isDarkColor = value.isDarkBackground;
  }

  delete migratedValue.bgColor;
  delete migratedValue.textColor;
  delete migratedValue.isDarkBackground;

  return migratedValue;
};

const migrateThemeColorRecursively = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => migrateThemeColorRecursively(item));
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const transformedObject = Object.entries(value).reduce<
    Record<string, unknown>
  >((acc, [key, nestedValue]) => {
    acc[key] = migrateThemeColorRecursively(nestedValue);
    return acc;
  }, {});

  if (!hasLegacyThemeColorKeys(transformedObject)) {
    return transformedObject;
  }

  return migrateLegacyThemeColor(transformedObject);
};

export const themeColorPropertyKeyMigration: Migration = {
  "*": {
    action: "updated",
    propTransformation: (props) => {
      return migrateThemeColorRecursively(props) as Record<string, any> & {
        id: string;
      };
    },
  },
};
