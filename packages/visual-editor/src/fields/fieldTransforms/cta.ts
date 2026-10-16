import { getDirections } from "@yext/pages-components";
import { getCTAType } from "../../internal/utils/ctaFieldUtils.ts";
import { i18nPageInstance } from "../../utils/i18n/i18nInstances.ts";
import {
  normalizeComprehensiveCTAValue,
  type ComprehensiveCTAValue,
} from "../styledFields/ComprehensiveCTAField.tsx";
import type {
  ResolvedCTAValue,
  ResolvedComprehensiveCTAValue,
} from "../fields.ts";
import {
  resolveEntityValue,
  resolveValue,
  type FieldTransformContext,
} from "./resolveValue.ts";

/** Resolves authored CTA data for both field transforms and the temporary renderer compatibility path. */
export function resolveComprehensiveCTAValue(
  value: Partial<ComprehensiveCTAValue> | undefined,
  context: FieldTransformContext
): ResolvedComprehensiveCTAValue {
  const normalized = normalizeComprehensiveCTAValue(value);
  return {
    ...normalized,
    data: {
      ...normalized.data,
      cta:
        normalized.data.actionType === "link"
          ? resolveCTAValue(normalized.data.cta, context)
          : undefined,
      buttonText: resolveValue(normalized.data.buttonText, context),
      ariaLabel: resolveValue(normalized.data.ariaLabel, context),
    },
  };
}

/** Resolves a CTA source, including the URL and label for Get Directions. */
export function resolveCTAValue(
  value: any,
  context: FieldTransformContext
): ResolvedCTAValue | undefined {
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
}
