import { TranslatableString } from "../../../../types/types.ts";
import { YextEntityField } from "../../../../editor/YextEntityFieldSelector.tsx";

const DEFAULT_LOCALE = "en";

const normalizeLocales = (locales: string[] | undefined): string[] => {
  if (!locales || locales.length === 0) {
    return [];
  }
  return Array.from(
    new Set(
      locales
        .map((locale) => (typeof locale === "string" ? locale.trim() : ""))
        .filter((locale) => locale.length > 0)
    )
  );
};

export const getMetaTitleMissingLocales = (
  titleField: YextEntityField<TranslatableString> | undefined,
  locales: string[]
): string[] => {
  if (!titleField?.constantValueEnabled) {
    return [];
  }

  const normalizedLocales = normalizeLocales(locales);
  const pageSetLocales =
    normalizedLocales.length > 0 ? normalizedLocales : [DEFAULT_LOCALE];
  const constantValue = titleField.constantValue;

  if (typeof constantValue === "string") {
    return constantValue.trim().length === 0 ? pageSetLocales : [];
  }

  if (!constantValue || typeof constantValue !== "object") {
    return pageSetLocales;
  }

  return pageSetLocales.filter((locale) => {
    const value = constantValue[locale];
    if (typeof value !== "string") {
      return true;
    }
    return value.trim().length === 0;
  });
};
