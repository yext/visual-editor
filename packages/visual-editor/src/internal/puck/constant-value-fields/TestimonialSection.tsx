import { type TestimonialStruct } from "../../../types/types.ts";
import { pt } from "../../../utils/i18n/platform.ts";
import { ArrayField } from "@measured/puck";

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
  getItemSummary: (item: TestimonialStruct, index: number) =>
    pt("testimonial", "Testimonial") + " " + ((index ?? 0) + 1),
};
