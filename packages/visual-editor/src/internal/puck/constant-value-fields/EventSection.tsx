import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { type EventStruct } from "../../../types/types.ts";

export const EVENT_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item: EventStruct, index?: number) =>
    pt("event", "Event") + " " + ((index ?? 0) + 1),
};
