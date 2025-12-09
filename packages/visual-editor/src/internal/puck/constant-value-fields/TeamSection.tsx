import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { type PersonStruct } from "../../../types/types.ts";

// This config is used by TeamCardsWrapper when constantValueEnabled is true
// It just manages an array of card IDs, not the full PersonStruct data
export const TEAM_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item: PersonStruct, index: number) =>
    pt("teamMember", "Team Member") + " " + ((index ?? 0) + 1),
};
