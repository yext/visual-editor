import { ArrayField } from "@measured/puck";
import { TestimonialStruct } from "../../../types/types.ts";
import { pt } from "../../../utils/i18n/platform.ts";

export const defaultTestimonial: TestimonialStruct = {
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    hasLocalizedValue: "true",
  },
  contributorName: { en: "Name", hasLocalizedValue: "true" },
  contributionDate: "July 22, 2022",
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
