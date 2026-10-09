import type { BaseField, FieldTransformFn } from "@puckeditor/core";
import type { StreamDocument } from "../../utils/types/StreamDocument.ts";
import {
  fieldToTransform,
  type TransformableField,
} from "./fieldToTransform.ts";

/**
 * Returns the authored field when it uses a supported transform. Theme colors
 * always transform; other fields opt in with `transform: true`. Puck `custom`
 * fields return their unwrapped Yext field. Unsupported fields return `undefined`.
 */
export function getTransformField(
  field: BaseField & { type: string }
): TransformableField | undefined {
  const authoredField =
    field.type === "custom" ? field.metadata?.yextField : field;
  return (authoredField?.type === "themeColor" ||
    authoredField?.transform === true) &&
    Object.hasOwn(fieldToTransform, authoredField.type)
    ? authoredField
    : undefined;
}

/**
 * Creates render transforms for one page and locale.
 *
 * 1. Identify theme colors and opted-in authored fields, including fields adapted to `custom`.
 * 2. Dispatch source resolution to the field handler, sharing localization and interpolation.
 * 3. Register handlers with Puck while preserving resolved data shapes for their renderers.
 * Authored values are never mutated or replaced in saved Puck data.
 */
export function createYextFieldTransforms(
  streamDocument: StreamDocument,
  locale: string
): Record<string, FieldTransformFn<BaseField & { type: string }>> {
  const context = { streamDocument, locale };
  const transform: FieldTransformFn<BaseField & { type: string }> = ({
    field,
    value,
  }) => {
    const authoredField = getTransformField(field);
    return authoredField
      ? fieldToTransform[authoredField.type](authoredField, value, context)
      : value;
  };
  return Object.fromEntries(
    [...Object.keys(fieldToTransform), "custom"].map((type) => [
      type,
      transform,
    ])
  );
}
