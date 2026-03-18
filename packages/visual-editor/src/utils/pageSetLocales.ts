import { StreamDocument } from "./types/StreamDocument.ts";

export const DEFAULT_LOCALE = "en";

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

export const getPageSetLocales = (
  streamDocument?: StreamDocument
): string[] => {
  try {
    const parsedPageSet = JSON.parse(streamDocument?._pageset ?? "");
    const fromPageSet = normalizeLocales(parsedPageSet?.scope?.locales);
    if (fromPageSet.length > 0) {
      return fromPageSet;
    }
  } catch {
    // ignore parse errors and use default
  }

  return [DEFAULT_LOCALE];
};
