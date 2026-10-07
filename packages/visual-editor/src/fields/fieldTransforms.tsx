import { getDirections } from "@yext/pages-components";
import { getCTAType } from "../internal/utils/ctaFieldUtils.ts";
import { i18nPageInstance } from "../utils/i18n/i18nInstances.ts";
import type { BaseField, FieldTransformFn } from "@puckeditor/core";
import {
  normalizeComprehensiveCTAValue,
  type ComprehensiveCTAValue,
} from "./styledFields/ComprehensiveCTAField.tsx";
import type {
  ResolvedComprehensiveCTAValue,
  YextFieldMap,
  YextPuckField,
} from "./fields.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import {
  resolveEmbeddedFieldsInString,
  resolveField,
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
    value?.constantValueEnabled
      ? value.constantValue
      : value?.field
        ? resolveField(context.streamDocument, value.field).value
        : undefined,
    context
  );
}

/** Resolves repeated-item mappings recursively against the selected item document. */
function resolveItemFields(
  fields: YextFieldMap<any>,
  value: any,
  context: FieldTransformContext
): any {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      const itemValue = value?.[key];
      if (field.type === "object") {
        return [key, resolveItemFields(field.objectFields, itemValue, context)];
      }
      if (field.type === "array") {
        return [
          key,
          (itemValue ?? []).map((item: any) =>
            resolveItemFields(field.arrayFields, item, context)
          ),
        ];
      }
      return [
        key,
        Object.hasOwn(fieldToTransform, field.type)
          ? fieldToTransform[field.type as TransformableField["type"]](
              field as TransformableField,
              itemValue,
              context
            )
          : resolveValue(itemValue, context),
      ];
    })
  );
}

/** Resolves authored CTA data for both field transforms and the temporary renderer compatibility path. */
export function resolveComprehensiveCTAValue(
  value: Partial<ComprehensiveCTAValue> | undefined,
  streamDocument: StreamDocument,
  locale: string
): ResolvedComprehensiveCTAValue {
  const context = { streamDocument, locale };
  const normalized = normalizeComprehensiveCTAValue(value);
  return {
    ...normalized,
    data: {
      ...normalized.data,
      cta:
        normalized.data.actionType === "link"
          ? fieldToTransform.ctaSelector(
              { type: "ctaSelector" },
              normalized.data.cta,
              context
            )
          : undefined,
      buttonText: resolveValue(normalized.data.buttonText, context),
      ariaLabel: resolveValue(normalized.data.ariaLabel, context),
    },
  };
}

/** Each supported authored field owns its source selection and render-value contract. */
const fieldToTransform: Record<
  TransformableField["type"],
  (field: TransformableField, value: any, context: FieldTransformContext) => any
> = {
  entityField: (field, value, context) => {
    if ("repeated" in field && field.repeated) {
      const { repeated } = field;
      const manual = value?.constantValueEnabled === true;
      const items = manual
        ? value?.constantValue
        : value?.field
          ? resolveField(context.streamDocument, value.field).value
          : undefined;
      return Array.isArray(items)
        ? items.map((item) =>
            resolveItemFields(
              manual ? repeated.manualItemFields : repeated.mappingFields,
              manual ? item : value.mappings,
              manual
                ? context
                : { ...context, streamDocument: item as StreamDocument }
            )
          )
        : [];
    }
    return resolveEntityValue(value, context);
  },
  translatableString: (_field, value, context) =>
    resolveValue(value, context) ?? "",
  video: (_field, value, context) => resolveValue(value, context),
  comprehensiveCTA: (_field, value, context) =>
    resolveComprehensiveCTAValue(value, context.streamDocument, context.locale),
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
