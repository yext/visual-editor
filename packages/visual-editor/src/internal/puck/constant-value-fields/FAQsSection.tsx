import { Field } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";

export const FAQ_SECTION_CONSTANT_CONFIG: Field<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item, index) => pt("faq", "FAQ") + " " + (index ?? 0 + 1),
};
