import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  AssetImageType,
  resolveLocalizedAssetImage,
  TranslatableAssetImage,
} from "../../../types/images.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import {
  type TranslatableCTA,
  type TranslatableString,
} from "../../../types/types.ts";
import { type StreamDocument } from "../../../utils/types/StreamDocument.ts";

type PhotoGalleryImageValue =
  | ImageType
  | ComplexImageType
  | TranslatableAssetImage
  | { assetImage: AssetImageType | TranslatableAssetImage };

export type PhotoGalleryItem = {
  image?: PhotoGalleryImageValue;
  link?: TranslatableString | TranslatableCTA;
};

export type ResolvedGalleryImage = {
  isEmpty: boolean;
  originalIndex: number;
  image: ImageType | AssetImageType;
  aspectRatio?: number;
  width?: number;
  originalImage?: PhotoGalleryImageValue;
  href?: string;
};

const LINK_REGEX_VALIDATION = /^(https?:\/\/[^\s]+|\/[^\s]*|#[^\s]*)$/;

/**
 * 1. Gets each image and its alternative text for the selected language.
 * 2. Gets the optional link from text, a CTA, or the image clickthrough URL.
 * 3. Removes empty images from the live page. Keeps them in the editor.
 */
export const getPhotoGalleryImageData = ({
  resolvedItems,
  locale,
  streamDocument,
  aspectRatio,
  width,
  isEditing,
  hasExplicitLinkMapping = false,
}: {
  resolvedItems: PhotoGalleryItem[] | undefined;
  locale: string;
  streamDocument?: StreamDocument;
  aspectRatio?: number;
  width?: number;
  isEditing: boolean;
  hasExplicitLinkMapping?: boolean;
}): {
  galleryImages: ResolvedGalleryImage[];
  hasRenderableImages: boolean;
} => {
  const allGalleryImages = (
    Array.isArray(resolvedItems) ? resolvedItems : []
  ).map((item, originalIndex) => {
    const rawImage = item.image;
    let image: ImageType | AssetImageType | undefined;

    if (
      typeof rawImage === "object" &&
      rawImage !== null &&
      "assetImage" in rawImage &&
      !("url" in rawImage)
    ) {
      image = resolveLocalizedAssetImage(rawImage.assetImage, locale);
    } else if (
      typeof rawImage === "object" &&
      rawImage !== null &&
      "image" in rawImage
    ) {
      image = rawImage.image;
    } else {
      image = resolveLocalizedAssetImage(rawImage, locale);
    }

    const altText = resolveComponentData(
      image?.alternateText ?? "",
      locale,
      streamDocument
    );
    const url = image?.url;
    const imageHeight = image?.height || 570;
    const imageWidth = image?.width || 1000;
    const isEmpty = !url || (typeof url === "string" && url.trim() === "");
    const inputLink =
      item.link ??
      (!hasExplicitLinkMapping &&
      rawImage &&
      typeof rawImage === "object" &&
      "clickthroughUrl" in rawImage &&
      typeof rawImage.clickthroughUrl === "string"
        ? rawImage.clickthroughUrl
        : undefined);
    const resolvedLink = inputLink
      ? resolveComponentData(
          typeof inputLink === "object" && "link" in inputLink
            ? (inputLink.link ?? "")
            : inputLink,
          locale,
          streamDocument
        )
      : undefined;
    const href =
      typeof resolvedLink === "string" &&
      LINK_REGEX_VALIDATION.test(resolvedLink.trim())
        ? resolvedLink.trim()
        : undefined;

    return {
      isEmpty,
      originalIndex,
      image: isEmpty
        ? {
            url: "",
            alternateText: altText,
            height: 570,
            width: 1000,
          }
        : {
            url,
            alternateText: altText,
            height: imageHeight,
            width: imageWidth,
          },
      aspectRatio,
      width: width || 1000,
      originalImage: rawImage,
      href,
    };
  });

  return {
    galleryImages: allGalleryImages.filter(
      (galleryImage) => isEditing || !galleryImage.isEmpty
    ),
    hasRenderableImages: allGalleryImages.some(
      (galleryImage) => !galleryImage.isEmpty
    ),
  };
};
