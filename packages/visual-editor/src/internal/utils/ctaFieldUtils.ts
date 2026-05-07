import { pt } from "../../utils/i18n/platform.ts";

export const CTA_SELECTION_TYPES = [
  "textAndLink",
  "getDirections",
  "presetImage",
] as const;

export type CTASelectionType = (typeof CTA_SELECTION_TYPES)[number];

type CTAFieldLike = {
  constantValueEnabled?: boolean;
  constantValue?: {
    ctaType?: CTASelectionType;
  };
  selectedType?: CTASelectionType;
};

export const ctaTypeOptions = () => {
  return [
    {
      label: pt("ctaTypes.textAndLink", "Text & Link"),
      value: "textAndLink",
    },
    {
      label: pt("ctaTypes.getDirections", "Get Directions"),
      value: "getDirections",
    },
    {
      label: pt("ctaTypes.presetImage", "Preset Image"),
      value: "presetImage",
    },
  ];
};

/**
 * Determines the CTA type for either static or Knowledge Graph CTA values.
 */
export const getCTAType = (entityField?: CTAFieldLike | null) => {
  const ctaType = entityField?.constantValueEnabled
    ? entityField.constantValue?.ctaType
    : entityField?.selectedType;

  return { ctaType };
};
