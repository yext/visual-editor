import { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";

// Use a function to create a fresh regex instance each time to avoid any potential
// state retention issues with the global flag, even though String.replace() should be safe
const getEmbeddedFieldRegex = () => /\[\[([a-zA-Z0-9._]+)\]\]/g;

// Export the regex pattern source for use in other files that need to create their own instances
export const embeddedFieldRegexSource = /\[\[([a-zA-Z0-9._]+)\]\]/g.source;

// For backward compatibility, export a regex instance (though it should be recreated per use)
export const embeddedFieldRegex = getEmbeddedFieldRegex();

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
  // Create a fresh regex instance to avoid any potential state retention
  const regex = getEmbeddedFieldRegex();
  return stringToResolve.replace(regex, (match, fieldName) => {
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
 * @param locale The locale to use for resolution.
 * @param visited WeakSet to track visited objects and prevent circular reference infinite recursion.
 * @param depth Current recursion depth to prevent stack overflow from very deep structures.
 * @returns The data with embedded fields resolved.
 */
export const resolveEmbeddedFieldsRecursively = (
  data: any,
  streamDocument: any,
  locale?: string,
  visited: WeakSet<object> = new WeakSet(),
  depth: number = 0
): any => {
  // Safety limit: prevent stack overflow from extremely deep structures
  // This is a defensive measure - normal data shouldn't exceed this depth
  const MAX_DEPTH = 100;
  if (depth > MAX_DEPTH) {
    console.warn(
      "[@yext/visual-editor] Maximum recursion depth exceeded in resolveEmbeddedFieldsRecursively. Returning original data."
    );
    return data;
  }

  // If data is a string, resolve any embedded fields within it.
  if (typeof data === "string") {
    return resolveEmbeddedFieldsInString(data, streamDocument, locale);
  }

  // If data is not an object (e.g., string, number, boolean), return it as is.
  if (typeof data !== "object" || data === null) {
    return data;
  }

  // Check for circular references - if we've seen this object before, return it as-is
  // to prevent infinite recursion
  if (visited.has(data)) {
    console.warn(
      "[@yext/visual-editor] Circular reference detected in resolveEmbeddedFieldsRecursively. Returning original data."
    );
    return data;
  }

  // Mark this object as visited
  visited.add(data);

  try {
    // Handle arrays by recursively calling this function on each item.
    if (Array.isArray(data)) {
      return data.map((item) =>
        resolveEmbeddedFieldsRecursively(
          item,
          streamDocument,
          locale,
          visited,
          depth + 1
        )
      );
    }

    // First, check if the object itself is a translatable shape that needs resolution.
    if (data.hasLocalizedValue === "true") {
      if (locale && data[locale]) {
        // Handle TranslatableString
        if (typeof data[locale] === "string") {
          const resolvedString = resolveEmbeddedFieldsInString(
            data[locale],
            streamDocument,
            locale
          );
          return { ...data, [locale]: resolvedString };
        }

        // Handle TranslatableRichText
        if (
          typeof data[locale] === "object" &&
          data[locale] !== null &&
          typeof data[locale].html === "string"
        ) {
          const resolvedHtml = resolveEmbeddedFieldsInString(
            data[locale].html,
            streamDocument,
            locale
          );
          return {
            ...data,
            [locale]: { ...data[locale], html: resolvedHtml },
          };
        }
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
        locale,
        visited,
        depth + 1
      );
    }
    return newData;
  } finally {
    // Note: We don't remove from visited here because we want to detect
    // circular references even if the same object appears at different depths
  }
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
