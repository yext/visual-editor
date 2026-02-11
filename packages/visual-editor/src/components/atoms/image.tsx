import * as React from "react";
import {
  ComplexImageType,
  Image as ImageComponent,
  ImageType,
} from "@yext/pages-components";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { AssetImageType, TranslatableAssetImage } from "../../types/images.ts";
import { TranslatableString } from "../../types/types.ts";
import { useTranslation } from "react-i18next";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";

export interface ImageProps {
  image: ImageType | ComplexImageType | TranslatableAssetImage;
  aspectRatio?: number;
  width?: number;
  className?: string;
  /** sizes attribute of the underlying img tag */
  sizes?: string;
  loading?: "lazy" | "eager";
  /**
   * Entity data used to resolve embedded fields in alt text.
   * Defaults to the stream document if not provided.
   */
  altTextEntity?: Record<string, any>;
}

export const getImageAltText = (
  image: ImageType | ComplexImageType | AssetImageType | undefined,
  locale: string,
  entityForAltText: StreamDocument | Record<string, any>
): string | undefined => {
  if (!image) {
    return undefined;
  }

  let altTextField: string | TranslatableString | undefined = undefined;
  if (isComplexImageType(image)) {
    altTextField = image.image.alternateText;
  } else if (image?.alternateText) {
    altTextField = image.alternateText;
  }

  return typeof altTextField === "object"
    ? resolveComponentData(altTextField, locale, entityForAltText)
    : altTextField;
};

export const Image: React.FC<ImageProps> = ({
  image: rawImage,
  aspectRatio,
  width,
  className,
  sizes,
  loading = "lazy",
  altTextEntity,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  const image = React.useMemo(() => {
    if (
      rawImage &&
      typeof rawImage === "object" &&
      "hasLocalizedValue" in rawImage
    ) {
      const localized = rawImage[i18n.language];
      if (typeof localized === "object") {
        return localized as AssetImageType;
      }
      return undefined;
    }
    return rawImage as ImageType | ComplexImageType | AssetImageType;
  }, [rawImage, i18n.language]);

  if (!image) {
    return null;
  }

  // Calculate height based on width and aspect ratio if width is provided
  const calculatedHeight =
    width && aspectRatio ? width / aspectRatio : undefined;

  // Determine container styles based on whether width is specified
  const containerStyles = width
    ? `overflow-hidden` // No w-full when width is specified
    : `overflow-hidden w-full`; // Use w-full when no width specified

  const altText = getImageAltText(
    image,
    i18n.language,
    altTextEntity ?? streamDocument
  );

  return (
    <div
      className={themeManagerCn(containerStyles, className)}
      style={width ? { width: `${width}px` } : undefined}
    >
      {aspectRatio ? (
        <ImageComponent
          image={{ ...image, alternateText: altText }}
          layout={"aspect"}
          aspectRatio={aspectRatio}
          className="object-cover w-full h-full"
          imgOverrides={{ sizes }}
          loading={loading}
        />
      ) : !!width && !!calculatedHeight ? (
        <ImageComponent
          image={{ ...image, alternateText: altText }}
          layout={"fixed"}
          width={width}
          height={calculatedHeight}
          className="object-cover"
          imgOverrides={{ sizes }}
          loading={loading}
        />
      ) : (
        <img
          src={isComplexImageType(image) ? image.image.url : image.url}
          alt={altText}
          className="object-cover w-full h-full"
          loading={loading}
        />
      )}
    </div>
  );
};

function isComplexImageType(
  image: ImageType | ComplexImageType | AssetImageType
): image is ComplexImageType {
  return "image" in image;
}

export type ImgSizesByBreakpoint = {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
};

/**
 * Creates an img sizes attribute based on the default Tailwind breakpoints.
 * Replaces `maxWidth` with the current page section max width from the theme.
 * Replaces `width` with the width parameter.
 * @param sizes - the width of the image at different breakpoints
 * @param width - the current width prop of the image
 * @returns a string for the sizes attribute of an img tag
 */
export const imgSizesHelper = (
  sizes: ImgSizesByBreakpoint,
  width?: string
): string => {
  const streamDocument = useDocument();

  let maxWidth = undefined;

  // Get the page section max width from the CSS variables (editor)
  // or the published theme (live page)
  try {
    if (
      typeof window !== "undefined" &&
      document?.getElementById("preview-frame")
    ) {
      const previewFrame = document.getElementById(
        "preview-frame"
      ) as HTMLIFrameElement;
      const el =
        previewFrame?.contentDocument?.getElementsByClassName(
          "components"
        )?.[0];

      if (el) {
        maxWidth = window
          .getComputedStyle(el)
          ?.getPropertyValue("--maxWidth-pageSection-contentWidth")
          ?.replace("!important", "");
      }
    } else if (streamDocument?.__?.theme) {
      maxWidth =
        JSON.parse(streamDocument.__.theme)?.[
          "--maxWidth-pageSection-contentWidth"
        ] ?? "1024px";
    }
  } catch {
    // use fallback max width
  }

  const updatedBreakpointSizes = Object.fromEntries(
    Object.entries(sizes).map(([key, value]) => [
      key,
      value
        .replace("maxWidth", maxWidth || "1440px")
        .replace("width", width || 640 + "px"),
    ])
  );

  let sizesString = updatedBreakpointSizes.base;
  if (updatedBreakpointSizes.sm) {
    sizesString =
      `(min-width: 640px) ${updatedBreakpointSizes.sm}, ` + sizesString;
  }
  if (updatedBreakpointSizes.md) {
    sizesString =
      `(min-width: 768px) ${updatedBreakpointSizes.md}, ` + sizesString;
  }
  if (updatedBreakpointSizes.lg) {
    sizesString =
      `(min-width: 1024px) ${updatedBreakpointSizes.lg}, ` + sizesString;
  }
  if (updatedBreakpointSizes.xl) {
    sizesString =
      `(min-width: 1280px) ${updatedBreakpointSizes.xl}, ` + sizesString;
  }
  if (updatedBreakpointSizes["2xl"]) {
    sizesString =
      `(min-width: 1536px) ${updatedBreakpointSizes["2xl"]}, ` + sizesString;
  }
  return sizesString;
};
