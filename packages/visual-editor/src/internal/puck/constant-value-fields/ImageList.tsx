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
        label: pt("url", "URL"),
      },
      height: {
        type: "text",
        label: pt("height", "height"),
      },
      width: {
        type: "text",
        label: pt("width", "width"),
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + i,
  };
};
