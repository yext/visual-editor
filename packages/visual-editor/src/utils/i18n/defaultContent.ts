import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import {
  LocalizedValues,
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../../types/types.ts";
import { componentDefaultRegistry } from "./componentDefaultRegistry.ts";
import { locales } from "./locales.ts";

const getDefaultTextForLocale = (
  key: string,
  locale: string,
  enDefault = ""
): string => {
  // Loaded eagerly from locale JSON so default lookup stays synchronous.
  const defaultsForLocale = componentDefaultRegistry[locale] ?? {};
  return defaultsForLocale[key] ?? enDefault;
};

const getPlainTextFromRichText = (rtf: RichText): string => {
  if (typeof rtf.html !== "string") {
    return "";
  }

  return rtf.html.replace(/<[^>]+>/g, "").trim();
};

/**
 * Builds a localized translatable string for all supported Visual Editor locales.
 *
 * Locale values are sourced from the component default registry by `key`.
 * If a locale-specific value is missing, only English falls back to `enDefault`;
 * non-English locales default to an empty string.
 *
 * @param key - Dot-delimited key in the locale defaults registry.
 * @param enDefault - English fallback when no `en` registry value exists.
 */
export const defaultText = (
  key: string,
  enDefault: string
): TranslatableString => {
  const localizedDefaults: LocalizedValues = {
    hasLocalizedValue: "true",
  };

  for (const locale of locales) {
    localizedDefaults[locale] = getDefaultTextForLocale(
      key,
      locale,
      locale === "en" ? enDefault : ""
    );
  }

  return localizedDefaults;
};

/**
 * Builds a localized translatable rich text value for all supported Visual Editor locales.
 *
 * Locale values are sourced from the component default registry by `key`.
 * If a locale-specific value is missing, only English falls back to `enDefault`;
 * non-English locales default to empty rich text. Rich text values are created
 * with `getDefaultRTF` so `html` and `json` stay in sync.
 *
 * @param key - Dot-delimited key in the locale defaults registry.
 * @param enDefault - English fallback when no `en` registry value exists.
 */
export const defaultRichText = (
  key: string,
  enDefault: string | RichText
): TranslatableRichText => {
  let baseRichText: RichText;
  if (typeof enDefault === "string") {
    baseRichText = getDefaultRTF(enDefault);
  } else {
    baseRichText = enDefault;
  }
  const enFallbackText = getPlainTextFromRichText(baseRichText);

  const localizedDefaults: Record<string, RichText | string> & {
    hasLocalizedValue: "true";
  } = {
    hasLocalizedValue: "true",
  };

  for (const locale of locales) {
    const fallbackText = locale === "en" ? enFallbackText : "";
    const localizedText = getDefaultTextForLocale(key, locale, fallbackText);
    localizedDefaults[locale] = getDefaultRTF(localizedText);
  }

  return localizedDefaults;
};
