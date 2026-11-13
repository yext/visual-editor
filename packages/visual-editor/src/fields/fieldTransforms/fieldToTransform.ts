import type {
  YextFieldDefinition,
  YextFieldMap,
  YextPuckField,
} from "../fields.ts";
import type { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { resolveField } from "../../utils/resolveYextEntityField.ts";
import { entityFieldFormatters } from "./entityFieldFormats.ts";
import { resolveCTAValue, resolveComprehensiveCTAValue } from "./cta.ts";
import { resolveCode } from "./code.ts";
import { resolveThemeColor } from "./themeColor.ts";
import {
  resolveStyledButton,
  resolveStyledImage,
  resolveStyledLink,
  resolveStyledPageSection,
  resolveStyledText,
} from "./styles.ts";
import {
  resolveEntityValue,
  resolveValue,
  type FieldTransformContext,
} from "./resolveValue.ts";

export const alwaysTransformedFieldTypes = [
  "code",
  "themeColor",
  "optional",
] as const satisfies readonly YextPuckField["type"][];

export type TransformableField = Extract<
  YextPuckField,
  | { transform?: boolean }
  | { type: (typeof alwaysTransformedFieldTypes)[number] }
>;

/** Resolves repeated-item mappings recursively against the selected item document. */
function resolveItemFields(
  fields: YextFieldMap<any>,
  value: any,
  context: FieldTransformContext
): any {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      const itemValue = value?.[key];
      if (field.type === "optional") {
        return [
          key,
          itemValue === undefined
            ? undefined
            : transformWrappedField(field.field, itemValue, context, true),
        ];
      }
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

/** Apply the wrapped field's own transformation rules without changing saved data. */
function transformWrappedField(
  field: YextFieldDefinition,
  value: any,
  context: FieldTransformContext,
  force = false
): any {
  if (value === undefined) return undefined;
  if (field.type === "custom" && field.metadata?.yextField) {
    return transformWrappedField(
      field.metadata.yextField,
      value,
      context,
      force
    );
  }
  if (field.type === "object") {
    if (value === null) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        field.objectFields[key]
          ? transformWrappedField(
              field.objectFields[key],
              child,
              context,
              force
            )
          : child,
      ])
    );
  }
  if (field.type === "array") {
    if (value === null) return value;
    return value.map((item: any) =>
      transformWrappedField(
        { type: "object", objectFields: field.arrayFields },
        item,
        context,
        force
      )
    );
  }
  if (field.type === "optional")
    return transformWrappedField(field.field, value, context, force);
  if (
    Object.hasOwn(fieldToTransform, field.type) &&
    (force ||
      ("transform" in field && field.transform === true) ||
      alwaysTransformedFieldTypes.some((type) => type === field.type))
  ) {
    const transformField = field as TransformableField;
    return fieldToTransform[transformField.type](
      transformField,
      value,
      context
    );
  }
  return force ? resolveValue(value, context) : value;
}

/** Each supported authored field owns its source selection and render-value contract. */
export const fieldToTransform: Record<
  TransformableField["type"],
  (field: TransformableField, value: any, context: FieldTransformContext) => any
> = {
  entityField: (field, value, context) => {
    if (field.type !== "entityField") {
      return value;
    }
    if (field.repeated) {
      const { repeated } = field;
      const manual = value?.constantValueEnabled === true || !value?.field;
      const items = manual
        ? value?.constantValue
        : resolveField(context.streamDocument, value.field).value;
      return Array.isArray(items)
        ? items.map((item) =>
            resolveItemFields(
              manual ? repeated.manualItemFields : repeated.mappingFields,
              manual ? item : value.mappings,
              manual
                ? context
                : {
                    ...context,
                    streamDocument: item as StreamDocument,
                    itemDocument: item,
                  }
            )
          )
        : [];
    }
    const resolved = resolveEntityValue(value, context);
    return field.format
      ? entityFieldFormatters[field.format](resolved, context)
      : resolved;
  },
  themeColor: (_field, value, context) => resolveThemeColor(value, context),
  code: (field, value, context) =>
    field.type === "code" ? resolveCode(field, value, context) : value,
  translatableString: (_field, value, context) =>
    resolveValue(value, context) ?? "",
  video: (_field, value, context) => resolveValue(value, context),
  comprehensiveCTA: (_field, value, context) =>
    resolveComprehensiveCTAValue(value, context),
  image: (_field, value, context) => resolveValue(value, context),
  multiSelector: (_field, value) =>
    (value?.selections ?? []).flatMap(({ value }: { value: unknown }) =>
      value === undefined ? [] : [value]
    ),
  ctaSelector: (_field, value, context) => resolveCTAValue(value, context),
  optional: (field, value, context) =>
    field.type === "optional"
      ? transformWrappedField(field.field, value, context)
      : value,
  styledText: (_field, value) => resolveStyledText(value),
  styledButton: (_field, value) => resolveStyledButton(value),
  styledLink: (_field, value) => resolveStyledLink(value),
  styledImage: (_field, value) => resolveStyledImage(value),
  styledPageSection: (_field, value) => resolveStyledPageSection(value),
};
