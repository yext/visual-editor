import { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { YextStructEntityField } from "../editor/YextStructFieldSelector.tsx";

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

  try {
    // check for the entity field in the document
    const steps: string[] = entityField.field.split(".");
    let missedStep = false;
    let current = streamDocument;
    for (let i = 0; i < steps.length; i++) {
      if (current?.[steps[i]] !== undefined) {
        current = current[steps[i]];
      } else {
        missedStep = true;
        break;
      }
    }
    if (!missedStep) {
      return current;
    }
  } catch (e) {
    console.error("Error in resolveYextEntityField:", e);
  }

  console.warn(`The field ${entityField.field} was not found in the document.`);
  return undefined;
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
  const embeddedFieldRegex = /\[\[([a-zA-Z0-9._]+)\]\]/g;
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
      locale
    );
  }
  return newData;
};

export const resolveYextStructField = <T extends Record<string, any>>(
  streamDocument: any,
  entityField: YextStructEntityField<T>,
  locale?: string
): T | undefined => {
  // If the entire struct is a constant value, resolveYextEntityField will recursively
  // resolve all embedded fields within it. We can just return that result.
  if (entityField.constantValueEnabled) {
    return resolveYextEntityField(streamDocument, entityField, locale);
  }

  // Otherwise, the struct is based on an entity field, with some properties
  // potentially being overridden by constant values.

  // 1. Get the base struct from the entity field path.
  const baseStructFromEntity = resolveYextEntityField(
    streamDocument,
    {
      ...entityField,
      // Temporarily disable constant value to ensure we get the entity field value.
      constantValueEnabled: false,
    },
    locale
  );

  // 2. Resolve any embedded fields that might exist in the constant values.
  const resolvedConstantValues = resolveEmbeddedFieldsRecursively(
    entityField.constantValue,
    streamDocument,
    locale
  );

  // 3. Start with the base entity value and merge in the overrides.
  const finalStruct = { ...baseStructFromEntity };
  for (const key in entityField.constantValueOverride) {
    if (entityField.constantValueOverride[key]) {
      // If override is true, take the value from our resolved constants.
      finalStruct[key] = resolvedConstantValues?.[key];
    }
  }

  return finalStruct as T;
};
