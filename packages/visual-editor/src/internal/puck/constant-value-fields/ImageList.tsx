import { Field } from "@puckeditor/core";
import { pt } from "../../../utils/i18n/platform.ts";
import { IMAGE_CONSTANT_CONFIG } from "./Image.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";

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
    defaultItemProps: {
      assetImage: {
        ...getRandomPlaceholderImageObject({ width: 1000, height: 570 }),
        width: 1000,
        height: 570,
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + ((i ?? 0) + 1),
  };
};
