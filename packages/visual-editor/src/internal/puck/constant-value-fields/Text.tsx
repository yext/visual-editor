import { ObjectField } from "@measured/puck";

export const TEXT_CONSTANT_CONFIG: ObjectField = {
  type: "object",
  objectFields: {
    en: {
      type: "text",
      label: "English",
    },
    es: {
      type: "text",
      label: "Spanish",
    },
  },
};
