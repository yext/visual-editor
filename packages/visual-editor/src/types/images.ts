import { ImageType } from "@yext/pages-components";
import { TranslatableString } from "./types";

/** Describes an image's aspect ratio. */
type ImageAspectRatio = {
  horizontalFactor: number;
  verticalFactor: number;
};

/** Describes the dimensions of an image. */
type ImageDimension = {
  width: number;
  height: number;
};

/** Describes the data corresponding to a single image. */
type ImageData = {
  url: string;
  dimension?: ImageDimension; // Undefined for private urls
  exifMetadata?: {
    rotate: number;
  };
};

/** Describes the data corresponding to an image rotation. */
type ImageRotation = {
  degree: number;
};

/** Describes the crop boundary box data */
type ImageCrop = {
  left: number;
  top: number;
  height: number;
  width: number;
  aspectRatio?: ImageAspectRatio;
};

type TransformKind = "CROP" | "ROTATION";

/** Outlines the possible image transformations. */
type ImageTransformation = ImageRotation | ImageCrop;

type ImageTransformations = Partial<Record<TransformKind, ImageTransformation>>;

/** Describes the data corresponding to a piece of image content. */
export type ImageContentData = {
  name?: string;
  transformedImage?: ImageData;
  originalImage?: ImageData;
  childImages?: ImageData[];
  transformations?: ImageTransformations;
  sourceUrl?: string;
  altText?: string;
};

export type AssetImageType = Omit<ImageType, "alternateText"> & {
  alternateText?: TranslatableString;
  // The url in ImageType is the source of truth for what image to display
  // However, we store the full asset object to support re-opening the asset drawer
  // and future proof any potential enhancements.
  assetImage?: ImageContentData;
};
