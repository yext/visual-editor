import { ObjectField, TextareaField, TextField } from "@measured/puck";

/**
 * Takes in a locale code like "es" and translates to the name using the targetLang
 * ex: getLocaleName("es", "en") -> "Spanish"
 * @param code
 * @param targetLang
 */
function getLocaleName(code: string, targetLang: string) {
  const displayNames = new Intl.DisplayNames([targetLang], {
    type: "language",
  });
  return displayNames.of(code);
}

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
          label: getLocaleName(lang, "en") || lang, // TODO replace "en" with storm language
        },
      ])
    ),
  };
};
