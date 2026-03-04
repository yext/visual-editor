import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";

export const embeddedFieldRegex = /\[\[([a-zA-Z0-9._]+)\]\]/g;

export const resolveYextEntityField = <T>(
  streamDocument: any,
  entityField: YextEntityField<T>,
  locale?: string
): T | undefined => {
  if (
    !entityField ||
    typeof entityField !== "object" ||
    !("field" in entityField) ||
    !("constantValue" in entityField)
  ) {
    return undefined;
  }

  // If constant value is enabled, recursively find and resolve any embedded
  // fields in translatable strings within the constant value.
  if (
    entityField.constantValueEnabled &&
    entityField.constantValue !== undefined
  ) {
    return resolveEmbeddedFieldsRecursively(
      entityField.constantValue,
      streamDocument,
      locale
    ) as T;
  }

  if (!entityField.field) {
    return entityField.constantValue as T;
  }

  return findField<T>(streamDocument, entityField.field);
};

/**
 * Takes a string and resolves any [[embedded_fields]] within it.
 * @param stringToResolve The string containing potential embedded fields.
 * @param streamDocument The entity document to use for resolving fields.
 * @returns The string with embedded fields replaced by their resolved values.
 */
export const resolveEmbeddedFieldsInString = (
  stringToResolve: string,
  streamDocument: any,
  locale?: string
): string => {
  return stringToResolve.replace(embeddedFieldRegex, (match, fieldName) => {
    const trimmedFieldName = fieldName.trim();
    if (!trimmedFieldName) {
      return "";
    }

    // Construct a temporary YextEntityField for the embedded field and resolve it.
    const embeddedEntityField: YextEntityField<unknown> = {
      field: trimmedFieldName,
      constantValue: undefined,
      constantValueEnabled: false,
    };

    const resolvedValue = resolveYextEntityField(
      streamDocument,
      embeddedEntityField,
      locale
    );

    if (resolvedValue === undefined || resolvedValue === null) {
      // If an embedded field can't be resolved, replace it with an empty string.
      return "";
    }

    // If the resolved value is an object, stringify it.
    if (typeof resolvedValue === "object") {
      return JSON.stringify(resolvedValue);
    }

    return String(resolvedValue);
  });
};

/**
 * Recursively traverses an object or array, finds translatable strings,
 * and resolves any embedded entity fields within them.
 * @param data The data to traverse (object, array, or primitive).
 * @param streamDocument The entity document to use for resolving fields.
 * @returns The data with embedded fields resolved.
 */
export const resolveEmbeddedFieldsRecursively = (
  data: any,
  streamDocument: any,
  locale?: string
): any => {
  // If data is a string, resolve any embedded fields within it.
  if (typeof data === "string") {
    return resolveEmbeddedFieldsInString(data, streamDocument, locale);
  }

  // If data is not an object (e.g., string, number, boolean), return it as is.
  if (typeof data !== "object" || data === null) {
    return data;
  }

  // Handle arrays by recursively calling this function on each item.
  if (Array.isArray(data)) {
    return data.map((item) =>
      resolveEmbeddedFieldsRecursively(item, streamDocument, locale)
    );
  }

  // First, check if the object itself is a translatable shape that needs resolution.
  if (data.hasLocalizedValue === "true" || "defaultValue" in data) {
    if (locale) {
      const localizedValue = data[locale] ?? data.defaultValue;
      // Handle TranslatableString
      if (typeof localizedValue === "string") {
        const resolvedString = resolveEmbeddedFieldsInString(
          localizedValue,
          streamDocument,
          locale
        );
        if ("defaultValue" in data && data.defaultValue === localizedValue) {
          return { ...data, defaultValue: resolvedString };
        }
        return { ...data, [locale]: resolvedString };
      }

      // Handle TranslatableRichText
      if (
        typeof localizedValue === "object" &&
        localizedValue !== null &&
        typeof localizedValue.html === "string"
      ) {
        const resolvedHtml = resolveEmbeddedFieldsInString(
          localizedValue.html,
          streamDocument,
          locale
        );
        if ("defaultValue" in data && data.defaultValue === localizedValue) {
          return {
            ...data,
            defaultValue: { ...localizedValue, html: resolvedHtml },
          };
        }
        return {
          ...data,
          [locale]: { ...localizedValue, html: resolvedHtml },
        };
      }

      // Preserve non-text default containers (e.g. localized image values)
      // by resolving nested embedded fields recursively.
      if (localizedValue !== undefined && localizedValue !== null) {
        const resolvedNonTextValue = resolveEmbeddedFieldsRecursively(
          localizedValue,
          streamDocument,
          locale
        );
        if ("defaultValue" in data && data.defaultValue === localizedValue) {
          return { ...data, defaultValue: resolvedNonTextValue };
        }
        return { ...data, [locale]: resolvedNonTextValue };
      }

      return data.hasLocalizedValue === "true" ? "" : data;
    } else {
      // If it's a translatable string but missing the locale,
      // we return an empty string.
      return "";
    }
  }

  // If it's a generic object, recursively call this function on all its values.
  const newData: { [key: string]: any } = {};
  for (const key in data) {
    newData[key] = resolveEmbeddedFieldsRecursively(
      data[key],
      streamDocument,
      locale
    );
  }
  return newData;
};

export const findField = <T>(
  document: any,
  fieldName: string
): T | undefined => {
  if (fieldName === "") {
    return undefined;
  }

  try {
    const levels: string[] = fieldName.split(".");
    let levelsExist = true;
    let current = document;
    for (let i = 0; i < levels.length; i++) {
      if (current?.[levels[i]] !== undefined) {
        current = current[levels[i]];
      } else {
        levelsExist = false;
        break;
      }
    }
    if (levelsExist) {
      return current;
    }
  } catch (e) {
    console.error("Error in findField:", e);
  }
  return undefined;
};
