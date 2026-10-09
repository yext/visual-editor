import type { YextFieldMap, YextPuckField } from "../fields.ts";
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

export type TransformableField = Extract<
  YextPuckField,
  { transform?: boolean } | { type: "themeColor" }
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
  optionalNumber: (_field, value) =>
    typeof value === "number" ? value : undefined,
  styledText: (_field, value) => resolveStyledText(value),
  styledButton: (_field, value) => resolveStyledButton(value),
  styledLink: (_field, value) => resolveStyledLink(value),
  styledImage: (_field, value) => resolveStyledImage(value),
  styledPageSection: (_field, value) => resolveStyledPageSection(value),
};
