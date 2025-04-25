import { ArrayField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";

export const IMAGE_LIST_CONSTANT_CONFIG: ArrayField<ImageType[]> = {
  label: "",
  type: "array",
  arrayFields: {
    url: {
      type: "text",
    },
    height: {
      type: "text",
    },
    width: {
      type: "text",
    },
  },
};
