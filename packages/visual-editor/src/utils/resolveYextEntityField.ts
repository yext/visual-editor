import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { type StreamDocument } from "./types/StreamDocument.ts";

export const embeddedFieldRegex = /\[\[([a-zA-Z0-9._]+)\]\]/g;

export type FieldResolution<T> = {
  value: T | undefined;
  traversedMultiValueReference: boolean;
};

/**
 * Resolves a Yext entity field from either a selected field path or a constant
 * value, including embedded field interpolation inside constants.
 */
export const resolveYextEntityField = <T>(
  streamDocument: StreamDocument | undefined,
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

  if (!streamDocument) {
    return undefined;
  }

  return resolveField<T>(streamDocument, entityField.field).value;
};

/**
 * Takes a string and resolves any [[embedded_fields]] within it.
 * @param stringToResolve The string containing potential embedded fields.
 * @param streamDocument The entity document to use for resolving fields.
 * @returns The string with embedded fields replaced by their resolved values.
 */
export const resolveEmbeddedFieldsInString = (
  stringToResolve: string,
  streamDocument: StreamDocument | undefined,
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
  streamDocument: StreamDocument | undefined,
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
      const localeValue = data[locale];
      const usesDefaultValue = localeValue === undefined;
      const localizedValue = usesDefaultValue ? data.defaultValue : localeValue;
      // Handle TranslatableString
      if (typeof localizedValue === "string") {
        const resolvedString = resolveEmbeddedFieldsInString(
          localizedValue,
          streamDocument,
          locale
        );
        if ("defaultValue" in data && usesDefaultValue) {
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
        if ("defaultValue" in data && usesDefaultValue) {
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
        if ("defaultValue" in data && usesDefaultValue) {
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
  streamDocument: StreamDocument,
  fieldName: string
): T | undefined => {
  return resolveField<T>(streamDocument, fieldName).value;
};

export const resolveField = <T>(
  streamDocument: StreamDocument,
  fieldName: string
): FieldResolution<T> => {
  if (fieldName === "") {
    return { value: undefined, traversedMultiValueReference: false };
  }

  let traversedMultiValueReference = false;
  try {
    const levels: string[] = fieldName.split(".");
    let current: unknown = streamDocument;
    for (let i = 0; i < levels.length; i++) {
      if (Array.isArray(current)) {
        if (current.length === 0) {
          return { value: undefined, traversedMultiValueReference };
        }

        if (current.length > 1) {
          traversedMultiValueReference = true;
        }

        current = current[0];
      }

      if (typeof current !== "object" || current === null) {
        return { value: undefined, traversedMultiValueReference };
      }

      const currentRecord = current as Record<string, unknown>;
      if (currentRecord[levels[i]] === undefined) {
        return { value: undefined, traversedMultiValueReference };
      }

      current = currentRecord[levels[i]];
    }

    return { value: current as T | undefined, traversedMultiValueReference };
  } catch (e) {
    console.error("Error in resolveField:", e);
  }
  return { value: undefined, traversedMultiValueReference };
};
