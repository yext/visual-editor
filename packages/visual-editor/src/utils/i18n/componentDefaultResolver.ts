import type { RichText } from "../../types/types.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { normalizeLocale } from "../normalizeLocale.ts";
import { DEFAULT_LOCALE } from "../pageSetLocales.ts";
import { resolveTranslationLocale } from "./resolveTranslationLocale.ts";
import { isRichText } from "../plainText.ts";
import { getTranslations } from "./getTranslations.ts";
import { locales as supportedLocales } from "./locales.ts";

const KNOWN_DEFAULT_RICH_TEXT_REGEX = /<span>(.*?)<\/span>/i;
const COMPONENT_DEFAULTS_NAMESPACE = "componentDefaults";
const supportedTranslationLocales = new Set(supportedLocales);
const localeDefaultsCache = new Map<string, Record<string, string>>();
const localeLoadPromises = new Map<string, Promise<Record<string, string>>>();
const enValueToKeys = new Map<string, string[]>();
let enIndexInitialization: Promise<void> | undefined;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const flattenStringLeafNodes = (
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      Object.assign(result, flattenStringLeafNodes(value, fullKey));
      continue;
    }

    if (typeof value === "string") {
      result[fullKey] = value;
    }
  }

  return result;
};

const extractComponentDefaults = (
  translations: Record<string, unknown>
): Record<string, string> => {
  const namespaceValue = translations[COMPONENT_DEFAULTS_NAMESPACE];
  if (!isPlainObject(namespaceValue)) {
    return {};
  }
  return flattenStringLeafNodes(namespaceValue, COMPONENT_DEFAULTS_NAMESPACE);
};

const loadLocaleDefaultsByResolvedLocale = async (
  resolvedLocale: string
): Promise<Record<string, string>> => {
  const cached = localeDefaultsCache.get(resolvedLocale);
  if (cached) {
    return cached;
  }

  const existingPromise = localeLoadPromises.get(resolvedLocale);
  if (existingPromise) {
    return existingPromise;
  }

  const loadPromise = (async () => {
    const localeTranslations = (await getTranslations(
      resolvedLocale,
      "platform"
    )) as Record<string, unknown>;
    const localeDefaults = extractComponentDefaults(localeTranslations);
    localeDefaultsCache.set(resolvedLocale, localeDefaults);
    localeLoadPromises.delete(resolvedLocale);
    return localeDefaults;
  })();

  localeLoadPromises.set(resolvedLocale, loadPromise);
  return loadPromise;
};

const initializeEnValueToKeys = async (): Promise<void> => {
  if (enValueToKeys.size > 0) {
    return;
  }

  if (enIndexInitialization) {
    return enIndexInitialization;
  }

  enIndexInitialization = (async () => {
    const enDefaults = await loadLocaleDefaultsByResolvedLocale(DEFAULT_LOCALE);
    enValueToKeys.clear();

    for (const [key, value] of Object.entries(enDefaults)) {
      const existingKeys = enValueToKeys.get(value) ?? [];
      existingKeys.push(key);
      enValueToKeys.set(value, existingKeys);
    }
  })();

  return enIndexInitialization;
};

/**
 * Normalizes and validates a locale for component default translation lookup.
 *
 * Returns undefined when the input is blank, non-string, or resolves to an
 * unsupported translation locale.
 */
export const normalizeComponentDefaultLocale = (
  locale: unknown
): string | undefined => {
  if (typeof locale !== "string") {
    return;
  }

  const normalizedLocale = normalizeLocale(locale).trim();
  if (!normalizedLocale) {
    return;
  }

  const resolvedLocale = resolveTranslationLocale(normalizedLocale);
  if (!supportedTranslationLocales.has(resolvedLocale)) {
    return;
  }

  return normalizedLocale;
};

/**
 * Loads component default translations into the in-memory cache for a locale.
 * Also ensures English defaults are indexed for deterministic reverse lookup.
 */
export const preloadComponentDefaultTranslations = async (
  locale: string
): Promise<boolean> => {
  const normalizedLocale = normalizeComponentDefaultLocale(locale);
  if (!normalizedLocale) {
    return false;
  }

  await Promise.all([
    initializeEnValueToKeys(),
    loadLocaleDefaultsByResolvedLocale(
      resolveTranslationLocale(normalizedLocale)
    ),
  ]);

  return true;
};

const getLoadedDefaultsForLocale = (locale: string): Record<string, string> => {
  const normalizedLocale = normalizeComponentDefaultLocale(locale);
  if (!normalizedLocale) {
    return {};
  }

  return (
    localeDefaultsCache.get(resolveTranslationLocale(normalizedLocale)) ?? {}
  );
};

/**
 * Resolves a localized default string for an English source value.
 *
 * A single English string can map to multiple default keys; resolution is
 * skipped when any key is missing in the target locale or mapped values differ.
 */
const resolveDeterministicLocalizedText = (
  locale: string,
  enValue: string
): string | undefined => {
  const keys = enValueToKeys.get(enValue);
  if (!keys || keys.length === 0) {
    return;
  }

  const localeDefaults = getLoadedDefaultsForLocale(locale);
  const values: string[] = [];

  for (const key of keys) {
    const value = localeDefaults[key];
    if (value === undefined) {
      return;
    }
    values.push(value);
  }

  if (new Set(values).size !== 1) {
    return;
  }

  return values[0];
};

/**
 * Extracts text from known default rich text HTML.
 *
 * Only `<span>...</span>` wrappers are supported.
 */
const extractKnownDefaultRichTextText = (
  value: unknown
): string | undefined => {
  if (!isRichText(value)) {
    return;
  }

  const match = value.html?.match(KNOWN_DEFAULT_RICH_TEXT_REGEX);
  if (!match) {
    return;
  }

  return match[1];
};

/**
 * Resolves an injectable localized value for a locale based on the English value.
 * Returns `undefined` when the value is ineligible or ambiguous.
 */
export const resolveLocalizedComponentDefaultValue = (
  locale: string,
  enValue: unknown
): string | RichText | undefined => {
  if (typeof enValue === "string") {
    return resolveDeterministicLocalizedText(locale, enValue);
  }

  const enRichTextText = extractKnownDefaultRichTextText(enValue);
  if (!enRichTextText) {
    return;
  }

  const localizedText = resolveDeterministicLocalizedText(
    locale,
    enRichTextText
  );
  return localizedText === undefined ? undefined : getDefaultRTF(localizedText);
};
