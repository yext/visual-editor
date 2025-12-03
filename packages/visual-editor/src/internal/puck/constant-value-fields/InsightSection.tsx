import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";

export const INSIGHT_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item, index) =>
    pt("insight", "Insight") + " " + ((index ?? 0) + 1),
};
