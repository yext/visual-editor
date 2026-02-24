import type { RichText } from "../../types/types.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { normalizeLocale } from "../normalizeLocale.ts";
import { DEFAULT_LOCALE } from "../pageSetLocales.ts";
import { resolveTranslationLocale } from "./resolveTranslationLocale.ts";
import { componentDefaultRegistry } from "./componentDefaultRegistry.ts";
import { isRichText } from "../plainText.ts";

const KNOWN_DEFAULT_RICH_TEXT_REGEX = /<span>(.*?)<\/span>/i;

const buildEnValueToKeysIndex = (): Map<string, string[]> => {
  const enDefaults = componentDefaultRegistry[DEFAULT_LOCALE] ?? {};
  const index = new Map<string, string[]>();

  for (const [key, value] of Object.entries(enDefaults)) {
    const existingKeys = index.get(value) ?? [];
    existingKeys.push(key);
    index.set(value, existingKeys);
  }

  return index;
};

const enValueToKeys = buildEnValueToKeysIndex();

const getDefaultsForLocale = (locale: string): Record<string, string> => {
  const normalizedLocale = normalizeLocale(locale);
  const resolvedLocale = resolveTranslationLocale(normalizedLocale);
  return componentDefaultRegistry[resolvedLocale] ?? {};
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

  const localeDefaults = getDefaultsForLocale(locale);
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
