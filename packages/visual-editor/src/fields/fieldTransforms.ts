import type { FieldTransforms } from "@puckeditor/core";
import type { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import {
  resolveEmbeddedFieldsInString,
  resolveYextEntityField,
} from "../utils/resolveYextEntityField.ts";
import { resolveItemValue } from "../utils/itemSource/itemSourceResolution.ts";
import type {
  RepeatedEntityFieldMetadata,
  RepeatedEntityFieldValue,
} from "../utils/itemSource/itemSourceTypes.ts";
import type { StreamDocument } from "../utils/types/StreamDocument.ts";
import type { YextFieldDefinition } from "./fields.ts";
import { i18nPageInstance } from "../utils/i18n/i18nInstances.ts";
import { getCTAType } from "../internal/utils/ctaFieldUtils.ts";
import type { ImageType } from "@yext/pages-components";
import { formatCurrency } from "../utils/productPrice.ts";
import type { ProductPrice } from "../types/types.ts";

/**
 * Build render-time transforms for Yext content fields automatically by field type.
 *
 * 1. Keep authored editor values and unrelated fields unchanged.
 * 2. Supply resolved content fields and plain item values to component renderers.
 *    Resolve content and repeated mappings using the active page document.
 * 3. Return plain values without changing Puck's saved data or slot lifecycle.
 */
export const createPuckFieldTransforms = (
  locale: string,
  streamDocument: StreamDocument,
  fieldSources = new Map<string, unknown>()
): FieldTransforms => {
  const transform = (
    {
      value,
      field,
      componentId,
      propPath,
    }: {
      value: any;
      field: {
        type: string;
        yextFieldType?: string;
        repeated?: RepeatedEntityFieldMetadata<Record<string, unknown>>;
      };
      componentId?: string;
      propPath?: string;
    },
    sourceDocument: StreamDocument = streamDocument
  ): any => {
    if (componentId === "root") {
      return value;
    }
    // Preserve binding metadata for source-dependent UI without wrapping resolved values.
    if (
      componentId &&
      propPath &&
      ["entityField", "image", "price"].includes(
        field.yextFieldType ?? field.type
      )
    ) {
      fieldSources.set(`${componentId}:${propPath}`, value);
    }
    if (value == null) {
      return field.repeated
        ? []
        : ["image", "price"].includes(field.yextFieldType ?? field.type)
          ? undefined
          : value;
    }

    switch (field.yextFieldType ?? field.type) {
      case "entityField": {
        if (field.repeated) {
          const authored = value as RepeatedEntityFieldValue<
            Record<string, unknown>
          >;
          const manual = authored.constantValueEnabled || !authored.field;
          const items = manual
            ? authored.constantValue
            : resolveYextEntityField(
                sourceDocument,
                {
                  field: authored.field,
                  constantValue: authored.constantValue,
                  constantValueEnabled: false,
                },
                locale
              );
          if (!Array.isArray(items)) {
            return [];
          }
          return items.map((item: any): Record<string, unknown> =>
            Object.fromEntries(
              Object.entries(
                manual
                  ? field.repeated!.manualItemFields
                  : field.repeated!.mappingFields
              ).map(([key, itemField]): [string, unknown] => [
                key,
                resolveItemValue(
                  itemField as YextFieldDefinition,
                  manual ? item?.[key] : authored.mappings?.[key],
                  sourceDocument,
                  manual ? undefined : item,
                  (childField, childValue, itemDocument): unknown =>
                    transform(
                      {
                        value: childValue,
                        field: childField,
                      },
                      itemDocument
                    )
                ),
              ])
            )
          );
        }
        return resolveComponentData(
          value as YextEntityField<unknown>,
          locale,
          sourceDocument,
          { output: "data" }
        );
      }
      case "translatableString":
        return resolveComponentData(value, locale, sourceDocument, {
          output: "data",
        });
      case "price": {
        const price = resolveComponentData<ProductPrice>(
          value,
          locale,
          sourceDocument,
          { output: "data" }
        );
        return formatCurrency(price?.value, price?.currencyCode, locale);
      }
      case "image": {
        const resolved = resolveComponentData<ImageType | { image: ImageType }>(
          value,
          locale,
          sourceDocument,
          {
            output: "data",
          }
        );
        if (!resolved) {
          return undefined;
        }
        const flattened = (
          "image" in resolved ? resolved.image : resolved
        ) as ImageType;
        return {
          ...flattened,
          alternateText: resolveComponentData(
            flattened.alternateText ?? "",
            locale,
            sourceDocument,
            { output: "data" }
          ),
        } as ImageType;
      }
      case "ctaSelector": {
        const cta = resolveComponentData<Record<string, unknown>>(
          value,
          locale,
          sourceDocument,
          { output: "data" }
        );
        const ctaType = getCTAType(value).ctaType ?? cta?.ctaType;
        return (
          cta && {
            ...cta,
            ctaType,
            ...(ctaType === "getDirections" && !value.constantValueEnabled
              ? {
                  label: i18nPageInstance.t("getDirections", {
                    lng: locale,
                    defaultValue: "Get Directions",
                  }),
                }
              : {}),
          }
        );
      }
      case "comprehensiveCTA": {
        return {
          ...value,
          data: {
            ...value.data,
            cta: transform(
              {
                value: value.data?.cta,
                field: { type: "ctaSelector" },
              },
              sourceDocument
            ),
            buttonText: resolveComponentData(
              value.data?.buttonText,
              locale,
              sourceDocument,
              { output: "data" }
            ),
            ariaLabel: resolveComponentData(
              value.data?.ariaLabel,
              locale,
              sourceDocument,
              { output: "data" }
            ),
          },
        };
      }
      case "code":
        return resolveEmbeddedFieldsInString(value, sourceDocument, locale);
      default:
        return value;
    }
  };

  return Object.fromEntries(
    [
      "custom",
      "entityField",
      "translatableString",
      "image",
      "price",
      "ctaSelector",
      "comprehensiveCTA",
      "code",
    ].map((type): [string, typeof transform] => [type, transform])
  ) as FieldTransforms;
};
