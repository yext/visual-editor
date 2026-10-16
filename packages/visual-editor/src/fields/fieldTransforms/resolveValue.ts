import type { StreamDocument } from "../../utils/types/StreamDocument.ts";
import {
  resolveEmbeddedFieldsInString,
  resolveField,
} from "../../utils/resolveYextEntityField.ts";

export type FieldTransformContext = {
  streamDocument: StreamDocument;
  locale: string;
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
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      resolveValue(nestedValue, context),
    ])
  );
}

/** Resolves the selected entity or constant source before localizing its data. */
export function resolveEntityValue(
  value: any,
  context: FieldTransformContext
): any {
  return resolveValue(
    value?.constantValueEnabled
      ? value.constantValue
      : value?.field
        ? resolveField(context.streamDocument, value.field).value
        : undefined,
    context
  );
}
