import { TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { StreamDocument } from "./types/StreamDocument.ts";
import { TranslatableString } from "../types/types.ts";
import { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";

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

export const getRelevantLocales = (
  templateMetadata?: TemplateMetadata,
  streamDocument?: StreamDocument
): string[] => {
  const fromTemplate = normalizeLocales(templateMetadata?.locales);
  if (fromTemplate.length > 0) {
    return fromTemplate;
  }

  try {
    const parsedPageSet = JSON.parse(streamDocument?._pageset ?? "");
    const fromPageSet = normalizeLocales(parsedPageSet?.scope?.locales);
    if (fromPageSet.length > 0) {
      return fromPageSet;
    }
  } catch {
    // ignore parse issues and fall through to default locale
  }

  return [DEFAULT_LOCALE];
};

export const getMetaTitleMissingLocales = (
  titleField: YextEntityField<TranslatableString> | undefined,
  locales: string[]
): string[] => {
  if (!titleField?.constantValueEnabled) {
    return [];
  }

  const normalizedLocales = normalizeLocales(locales);
  const relevantLocales =
    normalizedLocales.length > 0 ? normalizedLocales : [DEFAULT_LOCALE];
  const constantValue = titleField.constantValue;

  if (typeof constantValue === "string") {
    return constantValue.trim().length === 0 ? relevantLocales : [];
  }

  if (!constantValue || typeof constantValue !== "object") {
    return relevantLocales;
  }

  return relevantLocales.filter((locale) => {
    const value = constantValue[locale];
    if (typeof value !== "string") {
      return true;
    }
    return value.trim().length === 0;
  });
};
