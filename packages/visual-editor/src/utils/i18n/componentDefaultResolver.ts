import type { RichText } from "../../types/types.ts";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { normalizeLocale } from "../normalizeLocale.ts";
import { resolveTranslationLocale } from "./resolveTranslationLocale.ts";
import { isRichText } from "../plainText.ts";
import { locales as supportedLocales } from "./locales.ts";
import componentDefaultsEnTranslations from "../../../locales/components/en/visual-editor.json" with { type: "json" };
import { isPlainObject } from "./injectMissingLocalizedValues.ts";

const KNOWN_DEFAULT_RICH_TEXT_REGEX = /<span>(.*?)<\/span>/i;
const COMPONENT_DEFAULTS_NAMESPACE = "componentDefaults";
const supportedTranslationLocales = new Set(supportedLocales);

// Flattens nested objects into dot-delimited keys, including only string leaf values.
// Based on packages/visual-editor/src/utils/i18n/jsonUtils.ts flatten function.
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

/**
 * Extracts and flattens `componentDefaults` values from a translation payload.
 */
export const getComponentDefaultsFromTranslations = (
  translations: unknown
): Record<string, string> => {
  if (!isPlainObject(translations)) {
    return {};
  }

  const namespaceValue = translations[COMPONENT_DEFAULTS_NAMESPACE];
  if (!isPlainObject(namespaceValue)) {
    return {};
  }

  return flattenStringLeafNodes(namespaceValue, COMPONENT_DEFAULTS_NAMESPACE);
};

const enValueToKeys = (() => {
  const enDefaults = getComponentDefaultsFromTranslations(
    componentDefaultsEnTranslations
  );
  const index = new Map<string, string[]>();

  for (const [key, value] of Object.entries(enDefaults)) {
    const existingKeys = index.get(value) ?? [];
    existingKeys.push(key);
    index.set(value, existingKeys);
  }

  return index;
})();

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
 * Resolves a localized default string for an English source value.
 *
 * A single English string can map to multiple default keys; resolution is
 * skipped when any key is missing in the target locale or mapped values differ.
 */
const resolveDeterministicLocalizedText = (
  enValue: string,
  localizedComponentDefaults: Record<string, string>
): string | undefined => {
  const keys = enValueToKeys.get(enValue);
  if (!keys || keys.length === 0) {
    return;
  }

  const values: string[] = [];

  for (const key of keys) {
    const value = localizedComponentDefaults[key];
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
 * Resolves an injectable localized value for an English default using the
 * provided locale translation payload.
 */
export const resolveLocalizedComponentDefaultValue = (
  enValue: unknown,
  localizedComponentDefaults: Record<string, string>
): string | RichText | undefined => {
  if (typeof enValue === "string") {
    return resolveDeterministicLocalizedText(
      enValue,
      localizedComponentDefaults
    );
  }

  const enRichTextText = extractKnownDefaultRichTextText(enValue);
  if (!enRichTextText) {
    return;
  }

  const localizedText = resolveDeterministicLocalizedText(
    enRichTextText,
    localizedComponentDefaults
  );
  return localizedText === undefined ? undefined : getDefaultRTF(localizedText);
};
