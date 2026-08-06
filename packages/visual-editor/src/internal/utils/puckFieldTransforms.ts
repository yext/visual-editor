import { type FieldTransforms } from "@puckeditor/core";
import React from "react";
import { CTA } from "../../components/atoms/cta.tsx";
import { type YextCTAField } from "../../fields/CTASelectorField.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { getCTAType } from "./ctaFieldUtils.ts";
import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type EnhancedTranslatableCTA } from "../../types/types.ts";
import { type StreamDocument } from "../../utils/types/StreamDocument.ts";

/**
 * Creates editor-side field transforms for spike-only field types so components
 * can render from already-resolved props in the editor preview.
 */
export const createPuckFieldTransforms = (
  locale: string,
  streamDocument: StreamDocument
): FieldTransforms =>
  ({
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
  }) as unknown as FieldTransforms;
