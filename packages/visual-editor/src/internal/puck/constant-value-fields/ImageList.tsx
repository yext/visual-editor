import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18nPlatform.ts";
import { ImageType } from "@yext/pages-components";

export const IMAGE_LIST_CONSTANT_CONFIG = (): ArrayField<ImageType[]> => {
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
