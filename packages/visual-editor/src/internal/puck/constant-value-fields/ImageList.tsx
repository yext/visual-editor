import { ArrayField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import { pt } from "../../../utils/i18nPlatform.ts";

export const IMAGE_LIST_CONSTANT_CONFIG = (): ArrayField<ImageType[]> => {
  return {
    label: "",
    type: "array",
    arrayFields: {
      url: {
        type: "text",
        label: pt("fields.url", "URL"),
      },
      height: {
        type: "text",
        label: pt("fields.height", "height"),
      },
      width: {
        type: "text",
        label: pt("fields.width", "width"),
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + i,
  };
};
