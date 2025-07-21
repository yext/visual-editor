import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { GalleryImageType } from "../../../types/types";

export const IMAGE_LIST_CONSTANT_CONFIG = (): ArrayField<
  GalleryImageType[]
> => {
  return {
    label: "",
    type: "array",
    arrayFields: {
      url: {
        type: "text",
        label: pt("fields.url", "URL"),
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + i,
  };
};
