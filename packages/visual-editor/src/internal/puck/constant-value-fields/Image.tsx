import { type YextFieldDefinition } from "../../../fields/fields.ts";
import { type ImageField } from "../../../fields/ImageField.tsx";
import { pt } from "../../../utils/i18n/platform.ts";

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
};
