import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import {
  LocalizedValues,
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../../types/types.ts";

/**
 * Builds a translatable string seeded with an English default.
 *
 * Additional locales are injected later by per-locale default translation
 * processing in editor/template layout pipelines.
 *
 * @param key - Dot-delimited key in the locale defaults registry.
 * @param enDefault - English fallback when no `en` registry value exists.
 */
export const defaultText = (
  _key: string,
  enDefault: string
): TranslatableString => {
  const localizedDefaults: LocalizedValues = {
    hasLocalizedValue: "true",
    en: enDefault,
  };

  return localizedDefaults;
};

/**
 * Builds a translatable rich text value seeded with an English default.
 *
 * Additional locales are injected later by per-locale default translation
 * processing in editor/template layout pipelines.
 *
 * @param key - Dot-delimited key in the locale defaults registry.
 * @param enDefault - English fallback when no `en` registry value exists.
 */
export const defaultRichText = (
  _key: string,
  enDefault: string | RichText
): TranslatableRichText => {
  let baseRichText: RichText;
  if (typeof enDefault === "string") {
    baseRichText = getDefaultRTF(enDefault);
  } else {
    baseRichText = enDefault;
  }
  const localizedDefaults: {
    hasLocalizedValue: "true";
    [key: string]: RichText | "true";
  } = {
    hasLocalizedValue: "true",
    en: baseRichText,
  };

  return localizedDefaults as TranslatableRichText;
};
