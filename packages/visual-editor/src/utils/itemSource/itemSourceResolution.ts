import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type YextFieldDefinition } from "../../fields/fields.ts";
import { resolveYextEntityField } from "../resolveYextEntityField.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { isEntityFieldDefinition } from "./itemSourceFieldTransforms.ts";
import { type ResolvedItemField } from "./itemSourceTypes.ts";

/**
 * Runtime item resolution.
 *
 * 1. Resolve entity-field mappings against the current source item.
 * 2. Recursively resolve nested object and array mapping shapes.
 * 3. Return render-ready repeated item data without mutating authored props.
 */

/**
 * Resolves one authored item field into its render-ready value.
 */
export const resolveItemValue = <TValue>(
  field: YextFieldDefinition<TValue>,
  value: unknown,
  streamDocument: StreamDocument,
  itemDocument?: StreamDocument,
  transform?: (
    field: YextFieldDefinition,
    value: unknown,
    streamDocument: StreamDocument
  ) => unknown
): ResolvedItemField<TValue> => {
  if (isEntityFieldDefinition(field)) {
    const entityField = value as Partial<YextEntityField<unknown>> | undefined;
    if (!entityField?.constantValueEnabled && !entityField?.field) {
      return undefined as ResolvedItemField<TValue>;
    }

    if (!transform) {
      return resolveYextEntityField(
        itemDocument ?? streamDocument,
        {
          field: entityField?.field ?? "",
          constantValue: entityField?.constantValue,
          constantValueEnabled: entityField?.constantValueEnabled,
        },
        streamDocument.locale
      ) as ResolvedItemField<TValue>;
    }
  }

  if (transform && field.type !== "object" && field.type !== "array") {
    return transform(
      field,
      value,
      itemDocument ?? streamDocument
    ) as ResolvedItemField<TValue>;
  }

  if (field.type === "object" && "objectFields" in field) {
    const objectValue =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

    return Object.fromEntries(
      Object.entries(field.objectFields).map(([key, nestedField]) => [
        key,
        resolveItemValue(
          nestedField as YextFieldDefinition<any>,
          objectValue[key],
          streamDocument,
          itemDocument,
          transform
        ),
      ])
    ) as ResolvedItemField<TValue>;
  }

  if (
    field.type === "array" &&
    "arrayFields" in field &&
    Array.isArray(value)
  ) {
    return value.map((item) =>
      Object.fromEntries(
        Object.entries(field.arrayFields).map(([key, nestedField]) => [
          key,
          resolveItemValue(
            nestedField as YextFieldDefinition<any>,
            item?.[key],
            streamDocument,
            itemDocument,
            transform
          ),
        ])
      )
    ) as ResolvedItemField<TValue>;
  }

  return value as ResolvedItemField<TValue>;
};
