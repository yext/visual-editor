import { getDirections } from "@yext/pages-components";
import { getCTAType } from "../internal/utils/ctaFieldUtils.ts";
import { i18nPageInstance } from "../utils/i18n/i18nInstances.ts";
import type { BaseField, FieldTransformFn } from "@puckeditor/core";
import type { YextPuckField } from "./fields.ts";
import type { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  resolveEmbeddedFieldsInString,
  resolveYextEntityField,
} from "../utils/resolveYextEntityField.ts";

type TransformableField = Extract<YextPuckField, { transform?: boolean }>;

type FieldTransformContext = {
  streamDocument: StreamDocument;
  locale: string;
};

/**
 * Localizes nested values while retaining rich-text and image structure.
 * Resolves embedded fields while recursively visiting strings, objects, and lists.
 */
function resolveValue(value: any, context: FieldTransformContext): any {
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
function resolveEntityValue(value: any, context: FieldTransformContext): any {
  return resolveValue(
    value?.constantValueEnabled && value.constantValue !== undefined
      ? value.constantValue
      : resolveYextEntityField(
          context.streamDocument,
          value as YextEntityField<unknown>,
          context.locale
        ),
    context
  );
}

/** Each supported authored field owns its source selection and render-value contract. */
const fieldToTransform: Record<
  TransformableField["type"],
  (field: TransformableField, value: any, context: FieldTransformContext) => any
> = {
  entityField: (field, value, context) => {
    if ("repeated" in field && field.repeated) {
      throw new Error(
        "Field transforms do not support repeated entity sources."
      );
    }
    return resolveEntityValue(value, context);
  },
  translatableString: (_field, value, context) =>
    resolveValue(value, context) ?? "",
  image: (_field, value, context) => resolveValue(value, context),
  multiSelector: (_field, value) =>
    (value?.selections ?? []).flatMap(({ value }: { value: unknown }) =>
      value === undefined ? [] : [value]
    ),
  ctaSelector: (_field, value, context) => {
    const { ctaType } = getCTAType(value);
    const resolved =
      ctaType === "getDirections" && !value?.constantValueEnabled
        ? undefined
        : resolveEntityValue(value, context);
    if (ctaType === "getDirections") {
      return {
        ...resolved,
        ctaType,
        label:
          resolved?.label ||
          i18nPageInstance.getFixedT(context.locale)(
            "getDirections",
            "Get Directions"
          ),
        // Directions use the page's listings first, then its display coordinate.
        // User settable link props should not be used for get directions.
        link:
          getDirections(
            undefined,
            context.streamDocument.ref_listings,
            undefined,
            { provider: "google" },
            undefined
          ) ||
          getDirections(
            undefined,
            undefined,
            undefined,
            { provider: "google" },
            context.streamDocument.yextDisplayCoordinate
          ) ||
          "#",
        linkType: "DRIVING_DIRECTIONS",
      };
    }
    return resolved === undefined
      ? undefined
      : { ...resolved, ...(ctaType ? { ctaType } : {}) };
  },
  optionalNumber: (_field, value) =>
    typeof value === "number" ? value : undefined,
};

/** Retrieves the authored field definition retained by the Puck field adapter. */
export function getTransformField(
  field: BaseField & { type: string }
): TransformableField | undefined {
  const authoredField =
    field.type === "custom" ? field.metadata?.yextField : field;
  return authoredField?.transform === true &&
    Object.hasOwn(fieldToTransform, authoredField.type)
    ? authoredField
    : undefined;
}

/**
 * Creates opt-in render transforms for one page and locale.
 *
 * 1. Identify opted-in authored fields, including fields adapted to `custom`.
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
