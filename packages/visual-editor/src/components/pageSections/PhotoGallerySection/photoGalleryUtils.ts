import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  AssetImageType,
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
  TranslatableAssetImage,
} from "../../../types/images.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { type TranslatableString } from "../../../types/types.ts";

export type PhotoGalleryImageValue =
  | ImageType
  | ComplexImageType
  | AssetImageType
  | { assetImage: AssetImageType | TranslatableAssetImage };

export type PhotoGalleryItem = {
  image?: PhotoGalleryImageValue;
  link?: TranslatableString;
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
 * Normalizes the resolved photo gallery field value into the image shape used by
 * the gallery renderers and reports whether the mapped field produced any
 * renderable images.
 *
 * Empty images are retained only in editor mode so the wrapper can still render
 * its empty state; live rendering filters them out entirely.
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
  streamDocument?: Record<string, any>;
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
    let altText = "";

    if (
      typeof rawImage === "object" &&
      rawImage !== null &&
      "assetImage" in rawImage &&
      !("url" in rawImage)
    ) {
      if (isLocalizedAssetImage(rawImage.assetImage)) {
        image = resolveLocalizedAssetImage(rawImage.assetImage, locale);
        altText = resolveComponentData(
          image?.alternateText ?? "",
          locale,
          streamDocument
        );
      } else {
        image = rawImage.assetImage;
        altText = resolveComponentData(
          rawImage.assetImage?.alternateText ?? "",
          locale,
          streamDocument
        );
      }
    } else if (
      typeof rawImage === "object" &&
      rawImage !== null &&
      "image" in rawImage
    ) {
      image = rawImage.image;
      altText = rawImage.image?.alternateText ?? "";
    } else {
      image = rawImage;
      altText = resolveComponentData(
        rawImage?.alternateText ?? "",
        locale,
        streamDocument
      );
    }

    const url = image?.url;
    const imageHeight = image?.height || 570;
    const imageWidth = image?.width || 1000;
    const isEmpty = !url || (typeof url === "string" && url.trim() === "");
    const inputLink =
      item.link ??
      (!hasExplicitLinkMapping &&
      rawImage &&
      typeof rawImage === "object" &&
      "clickthroughUrl" in rawImage
        ? rawImage.clickthroughUrl
        : undefined);
    const resolvedLink = inputLink
      ? resolveComponentData(
          inputLink as TranslatableString,
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
