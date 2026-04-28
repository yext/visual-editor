import { msg } from "../../../utils/i18n/platform.ts";
import {
  buildLocatorDisplayOptions,
  type ImagePayload,
  type ImageField,
} from "../../../fields/ImageField.tsx";
import { TemplateMetadata } from "../../types/templateMetadata.ts";

export type { ImagePayload };

export const IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
};

export const LOCATOR_IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
  label: msg("fields.image", "Image"),
  getAltTextOptions: (templateMetadata: TemplateMetadata) =>
    buildLocatorDisplayOptions(templateMetadata?.locatorDisplayFields),
};
