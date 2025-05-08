import { ObjectField, TextareaField, TextField } from "@measured/puck";

const languageMapper: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ja: "Japanese",
  ko: "Korean",
};

/**
 * Takes in a list of locales and returns an object with valid and invalid locales.
 */
const validateLocales = (locales?: string[]) => {
  if (!locales) {
    console.warn("No locales provided");
    return {
      validLocales: [],
      invalidLocales: [],
    };
  }

  const validLocales: string[] = [];
  const invalidLocales: string[] = [];

  locales.forEach((locale) => {
    try {
      const resolved = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
      if (resolved.toLocaleLowerCase() === locale.toLocaleLowerCase()) {
        validLocales.push(locale);
      } else {
        invalidLocales.push(locale);
      }
    } catch {
      invalidLocales.push(locale);
      return;
    }
  });
  return {
    validLocales,
    invalidLocales,
  };
};

export const getTranslatableTextConfig = (
  isMultiline?: boolean,
  locales?: string[]
): TextField | TextareaField | ObjectField => {
  if (!locales) {
    return {
      type: isMultiline ? "textarea" : "text",
      label: "",
    };
  }

  const validatedLocales = validateLocales(locales);
  if (validatedLocales.invalidLocales.length > 0) {
    console.warn(
      `The following locales are invalid: ${validatedLocales.invalidLocales.join(
        ", "
      )}.`
    );
  }

  return {
    type: "object",
    objectFields: Object.fromEntries(
      validatedLocales.validLocales.map((lang) => [
        lang,
        {
          type: isMultiline ? "textarea" : "text",
          label: languageMapper[lang] || lang,
        },
      ])
    ),
  };
};
