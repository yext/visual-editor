import {
  ComplexImageType,
  ImageType,
  type LinkType,
} from "@yext/pages-components";
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
import { isNonNormalizableLinkType } from "../../../utils/normalizeLink.ts";

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
  linkType?: LinkType;
  ariaLabel?: string;
};

const LINK_REGEX_VALIDATION =
  /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|\/[^\s]*|#[^\s]*)$/i;

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
    const cta =
      inputLink && typeof inputLink === "object" && "link" in inputLink
        ? (inputLink as TranslatableCTA)
        : undefined;
    const linkType = cta?.linkType ?? "URL";
    const resolvedLink = inputLink
      ? resolveComponentData(
          cta ? (cta.link ?? "") : inputLink,
          locale,
          streamDocument
        )
      : undefined;
    const href =
      typeof resolvedLink === "string" &&
      resolvedLink.trim() &&
      (isNonNormalizableLinkType(linkType) ||
        LINK_REGEX_VALIDATION.test(resolvedLink.trim()))
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
      linkType,
      ariaLabel:
        !altText && cta?.label
          ? resolveComponentData(cta.label, locale, streamDocument)
          : undefined,
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
