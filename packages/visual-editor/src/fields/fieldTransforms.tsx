import type { BaseField, FieldTransformFn } from "@puckeditor/core";
import type { EntityFieldSelectorField } from "./EntityFieldSelectorField.tsx";
import type { TranslatableStringField } from "./TranslatableStringField.tsx";
import type { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  resolveEmbeddedFieldsRecursively,
  resolveYextEntityField,
} from "../utils/resolveYextEntityField.ts";

/** Retrieves the authored field definition retained by the Puck field adapter. */
export function getTransformField(
  field: BaseField & { type: string }
): EntityFieldSelectorField | TranslatableStringField | undefined {
  const authoredField =
    field.type === "custom" ? field.metadata?.yextField : field;
  if (
    authoredField?.transform === true &&
    (authoredField.type === "entityField" ||
      authoredField.type === "translatableString")
  ) {
    return authoredField;
  }
  return undefined;
}

/** Localizes nested values while retaining rich-text and image structure. */
function localizeValue(value: any, locale: string): any {
  if (!value || typeof value !== "object") {
    return value;
  }
  if (value.hasLocalizedValue === "true" || "defaultValue" in value) {
    return localizeValue(value[locale] ?? value.defaultValue, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeValue(item, locale));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      localizeValue(nestedValue, locale),
    ])
  );
}

/**
 * Creates opt-in render transforms for one page and locale.
 *
 * 1. Identify opted-in authored fields, including fields adapted to `custom`.
 * 2. Resolve entity bindings, constant values, localization, and embedded fields.
 * 3. Preserve resolved rich-text data and other value shapes for their renderers.
 * Authored values are never mutated or replaced in saved Puck data.
 */
export function createYextFieldTransforms(
  streamDocument: StreamDocument,
  locale: string
): Record<
  "entityField" | "translatableString" | "custom",
  FieldTransformFn<BaseField & { type: string }>
> {
  const transform = ({
    field,
    value,
  }: {
    field: BaseField & { type: string };
    value: any;
  }): any => {
    const authoredField = getTransformField(field);
    if (!authoredField) {
      return value;
    }
    if (authoredField.type === "entityField" && authoredField.repeated) {
      throw new Error(
        "Field transforms do not support repeated entity sources."
      );
    }
    const resolvedValue = resolveEmbeddedFieldsRecursively(
      localizeValue(
        authoredField.type === "entityField"
          ? value?.constantValueEnabled && value.constantValue !== undefined
            ? value.constantValue
            : resolveYextEntityField(
                streamDocument,
                value as YextEntityField<unknown>,
                locale
              )
          : value,
        locale
      ),
      streamDocument,
      locale
    );
    if (authoredField.type === "translatableString") {
      return resolvedValue ?? "";
    }
    return resolvedValue;
  };
  return {
    entityField: transform,
    translatableString: transform,
    custom: transform,
  };
}
