import type { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { ITEM_SOURCE_SELF_FIELD } from "../../utils/itemSource/itemSourceTypes.ts";
import {
  resolveEmbeddedFieldsInString,
  resolveField,
} from "../../utils/resolveYextEntityField.ts";

export type FieldTransformContext = {
  streamDocument: StreamDocument;
  locale: string;
  /** The complete linked item, including primitive list items. */
  itemDocument?: unknown;
};

/**
 * Localizes nested values while retaining rich-text and image structure.
 * Resolves embedded fields while recursively visiting strings, objects, and lists.
 */
export function resolveValue(value: any, context: FieldTransformContext): any {
  if (typeof value === "string") {
    return resolveEmbeddedFieldsInString(
      value,
      context.streamDocument,
      context.locale
    );
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  if (value.hasLocalizedValue === "true" || "defaultValue" in value) {
    return resolveValue(value[context.locale] ?? value.defaultValue, context);
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, context));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => {
      if (
        key === "json" &&
        typeof nestedValue === "string" &&
        nestedValue.includes("[[")
      ) {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(nestedValue);
        } catch {
          return [key, nestedValue];
        }
        // Interpolate parsed string values so quotes and newlines remain escaped.
        return [key, JSON.stringify(resolveValue(parsedJson, context))];
      }
      return [key, resolveValue(nestedValue, context)];
    })
  );
}

/** Resolves the selected entity or constant source before localizing its data. */
export function resolveEntityValue(
  value: any,
  context: FieldTransformContext
): any {
  // Cleared linked-item mappings keep constants for reuse in static mode.
  if (
    "itemDocument" in context &&
    !value?.constantValueEnabled &&
    !value?.field
  ) {
    return undefined;
  }
  return resolveValue(
    value?.constantValueEnabled || !value?.field
      ? value?.constantValue
      : value.field === ITEM_SOURCE_SELF_FIELD && "itemDocument" in context
        ? context.itemDocument
        : resolveField(context.streamDocument, value.field).value,
    context
  );
}
