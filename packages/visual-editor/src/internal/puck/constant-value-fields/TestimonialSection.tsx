import { ArrayField } from "@measured/puck";
import { TestimonialStruct } from "../../../types/types.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { pt } from "../../../utils/i18n/platform.ts";

export const defaultTestimonial: TestimonialStruct = {
  description: {
    en: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ),
    hasLocalizedValue: "true",
  },
  contributorName: {
    en: "Customer Name",
    hasLocalizedValue: "true",
  },
  contributionDate: "2024-01-01",
};

// This config is used by TestimonialCardsWrapper when constantValueEnabled is true
// It just manages an array of card IDs, not the full TestimonialStruct data
export const TESTIMONIAL_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item, index) =>
    pt("testimonial", "Testimonial") + " " + ((index ?? 0) + 1),
};
