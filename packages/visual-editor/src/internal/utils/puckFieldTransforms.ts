import { type FieldTransforms } from "@puckeditor/core";
import { type ComplexImageType, type ImageType } from "@yext/pages-components";
import React from "react";
import { CTA } from "../../components/atoms/cta.tsx";
import { Image } from "../../components/atoms/image.tsx";
import { type YextCTAField } from "../../fields/CTASelectorField.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { getCTAType } from "./ctaFieldUtils.ts";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type EnhancedTranslatableCTA } from "../../types/types.ts";
import { type StreamDocument } from "../../utils/types/StreamDocument.ts";
import {
  type TranslatableAssetImage,
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
} from "../../types/images.ts";

type TestImageValue =
  | (YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage> & {
      aspectRatio?: number;
      width?: number;
      imageFillType?: "fill" | "fit";
    })
  | undefined;

const isAuthoredTestField = (
  value: unknown,
  fieldType: string
): value is { field: string; constantValueEnabled: boolean } => {
  const isValid =
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    typeof value.field === "string" &&
    "constantValueEnabled" in value &&
    typeof value.constantValueEnabled === "boolean";

  if (!isValid) {
    console.error(
      `[VisualEditor] Invalid ${fieldType} value. Generated components must provide an authored Yext field object.`
    );
  }

  return isValid;
};

const safelyTransform = <T>(
  fieldType: string,
  transform: () => T
): T | undefined => {
  try {
    return transform();
  } catch (error) {
    console.error(
      `[VisualEditor] Failed to resolve ${fieldType} in a generated component.`,
      error
    );
    return undefined;
  }
};

/**
 * Creates field transforms for spike-only field types so components can render
 * from already-resolved props in both editor preview and render mode.
 */
export const createPuckFieldTransforms = (
  locale: string,
  streamDocument?: StreamDocument
): FieldTransforms => {
  if (!streamDocument) {
    return {};
  }

  return {
    testEntityField: ({ value }: { value: unknown }) => {
      if (!isAuthoredTestField(value, "testEntityField")) {
        return undefined;
      }

      return safelyTransform("testEntityField", () =>
        resolveComponentData(
          value as YextEntityField<string>,
          locale,
          streamDocument,
          {
            output: "plainText",
          }
        )
      );
    },
    testRichText: ({ value }: { value: unknown }) => {
      if (!isAuthoredTestField(value, "testRichText")) {
        return undefined;
      }

      return safelyTransform("testRichText", () => {
        const resolvedValue = resolveComponentData(
          value as YextEntityField<unknown>,
          locale,
          streamDocument
        );
        if (
          typeof resolvedValue !== "string" &&
          !React.isValidElement(resolvedValue)
        ) {
          console.error(
            "[VisualEditor] Invalid resolved testRichText value in a generated component."
          );
          return undefined;
        }
        return resolvedValue;
      });
    },
    testImage: ({ value }: { value: unknown }) => {
      if (!isAuthoredTestField(value, "testImage")) {
        return undefined;
      }

      const authoredValue = value as TestImageValue;

      return safelyTransform("testImage", () => {
        const resolvedImage = resolveComponentData<
          ImageType | ComplexImageType | TranslatableAssetImage | undefined
        >(
          {
            field: authoredValue?.field ?? "",
            constantValue: authoredValue?.constantValue,
            constantValueEnabled: authoredValue?.constantValueEnabled ?? true,
          },
          locale,
          streamDocument
        );

        if (!resolvedImage) {
          return undefined;
        }

        const localizedImage = isLocalizedAssetImage(resolvedImage)
          ? resolveLocalizedAssetImage(resolvedImage, locale)
          : resolvedImage;
        if (
          !localizedImage ||
          (typeof localizedImage === "object" &&
            !("url" in localizedImage) &&
            !("image" in localizedImage))
        ) {
          console.error(
            "[VisualEditor] Invalid resolved testImage value in a generated component."
          );
          return undefined;
        }

        return React.createElement(Image, {
          image: localizedImage,
          aspectRatio: authoredValue?.aspectRatio,
          imageFillType: authoredValue?.imageFillType,
          width: authoredValue?.width,
          className: "max-w-full rounded-image-borderRadius w-full",
          streamDocumentOverride: streamDocument,
        });
      });
    },
    testCTA: ({ value }: { value: unknown }) => {
      if (!isAuthoredTestField(value, "testCTA")) {
        return undefined;
      }

      return safelyTransform("testCTA", () => {
        const cta = resolveComponentData<EnhancedTranslatableCTA>(
          value as YextCTAField,
          locale,
          streamDocument
        );

        if (!cta || typeof cta !== "object") {
          return undefined;
        }

        const authoredValue = value as YextCTAField;
        const { ctaType } = getCTAType(authoredValue);
        const resolvedCtaType =
          ctaType ??
          (authoredValue.constantValueEnabled
            ? authoredValue.selectedType
            : undefined) ??
          cta.ctaType;

        if (!resolvedCtaType) {
          return undefined;
        }

        const label =
          resolveComponentData(cta.label, locale, streamDocument) ?? "";
        const link =
          resolvedCtaType === "getDirections"
            ? undefined
            : resolveComponentData(cta.link, locale, streamDocument);

        if (!label && resolvedCtaType !== "presetImage") {
          return undefined;
        }

        return React.createElement(CTA, {
          actionType: "link",
          ctaType: resolvedCtaType,
          label,
          link,
          linkType: cta.linkType ?? "URL",
          normalizeLink: true,
          setPadding: true,
        });
      });
    },
  } as unknown as FieldTransforms;
};
