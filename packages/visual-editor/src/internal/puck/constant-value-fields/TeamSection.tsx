import { ArrayField } from "@measured/puck";
import { PersonStruct } from "../../../types/types.ts";
import { pt } from "../../../utils/i18n/platform.ts";

export const defaultPerson: PersonStruct = {
  name: { en: "First Last", hasLocalizedValue: "true" },
  title: { en: "Associate Agent", hasLocalizedValue: "true" },
  phoneNumber: "(202) 770-6619 ",
  email: "jkelley@[company].com",
  cta: {
    label: { en: "Visit Profile", hasLocalizedValue: "true" },
    link: "#",
    linkType: "URL",
    ctaType: "textAndLink",
  },
  headshot: {
    url: "https://placehold.co/80x80",
    height: 80,
    width: 80,
  },
};

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
  getItemSummary: (item, index) =>
    pt("teamMember", "Team Member") + " " + ((index ?? 0) + 1),
};
