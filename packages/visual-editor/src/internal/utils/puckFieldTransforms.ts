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
    testEntityField: ({
      value,
      field,
    }: {
      value: YextEntityField<string>;
      field: { output?: "plainText" };
    }) =>
      resolveComponentData(value, locale, streamDocument, {
        output: field.output ?? "plainText",
      }),
    testRichText: ({ value }: { value: YextEntityField<unknown> }) =>
      resolveComponentData(value, locale, streamDocument),
    testImage: ({ value }: { value: TestImageValue }) => {
      const resolvedImage = resolveComponentData<
        ImageType | ComplexImageType | TranslatableAssetImage | undefined
      >(
        {
          field: value?.field ?? "",
          constantValue: value?.constantValue,
          constantValueEnabled: value?.constantValueEnabled ?? true,
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
      if (!localizedImage) {
        return undefined;
      }

      return React.createElement(Image, {
        image: localizedImage,
        aspectRatio: value?.aspectRatio,
        imageFillType: value?.imageFillType,
        width: value?.width,
        className: "max-w-full rounded-image-borderRadius w-full",
        streamDocumentOverride: streamDocument,
      });
    },
    testCTA: ({ value }: { value: YextCTAField }) => {
      const cta = resolveComponentData<EnhancedTranslatableCTA>(
        value,
        locale,
        streamDocument
      );

      if (!cta) {
        return undefined;
      }

      const { ctaType } = getCTAType(value);
      const resolvedCtaType =
        ctaType ??
        (value.constantValueEnabled ? value.selectedType : undefined) ??
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
    },
  } as unknown as FieldTransforms;
};
