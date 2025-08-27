import { Field } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { IMAGE_CONSTANT_CONFIG } from "./Image.tsx";

export const IMAGE_LIST_CONSTANT_CONFIG = (): Field<any> => {
  return {
    label: "",
    type: "array",
    arrayFields: {
      assetImage: {
        ...IMAGE_CONSTANT_CONFIG,
        label: pt("fields.image", "Image"),
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + i,
  };
};
