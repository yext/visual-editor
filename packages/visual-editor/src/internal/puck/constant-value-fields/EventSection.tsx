import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";

export const EVENT_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item, index) =>
    pt("event", "Event") + " " + ((index ?? 0) + 1),
};
