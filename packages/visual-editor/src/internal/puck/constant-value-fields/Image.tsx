import { type YextFieldDefinition } from "../../../fields/fields.ts";
import { type ImageField } from "../../../fields/ImageField.tsx";
import { pt } from "../../../utils/i18n/platform.ts";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";

export const IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
};

export const IMAGE_LIST_CONSTANT_CONFIG: YextFieldDefinition = {
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
