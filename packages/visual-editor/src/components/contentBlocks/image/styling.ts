import { YextFields } from "../../../fields/fields.ts";
import { ImageFillType } from "../../../types/images.ts";
import { msg } from "../../../utils/i18n/platform.ts";

/** Props for displaying an image */
export interface ImageStylingProps {
  /** The aspect ratio of the image */
  aspectRatio: number;
  width?: number;
  imageConstrain?: "fill" | "fixed";
  imageFillType?: ImageFillType;
}

export const ImageStylingFields: YextFields<ImageStylingProps> = {
  imageConstrain: {
    label: msg("fields.imageConstrain", "Image Constrain"),
    type: "radio",
    options: [
      {
        label: msg("fields.options.fillContainer", "Fill Container"),
        value: "fill",
      },
      {
        label: msg("fields.options.fixedWidth", "Fixed Width"),
        value: "fixed",
      },
    ],
    visible: false,
  },
  imageFillType: {
    type: "basicSelector",
    label: msg("fields.imageFillType", "Image Fill Type"),
    options: [
      { label: msg("fields.options.fill", "Fill"), value: "fill" },
      { label: msg("fields.options.fit", "Fit"), value: "fit" },
    ],
  },
  width: {
    type: "number",
    label: msg("fields.options.width", "Width"),
    min: 0,
  },
  aspectRatio: {
    type: "basicSelector",
    label: msg("fields.options.aspectRatio", "Aspect Ratio"),
    options: "ASPECT_RATIO",
  },
};
