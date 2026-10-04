import * as React from "react";
import { Image as ImageComponent, ImageType } from "@yext/pages-components";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { ImageFillType } from "../../types/images.ts";
import { getThemeValue } from "../../utils/getThemeValue.ts";

export interface ImageProps {
  image: ImageType;
  aspectRatio?: number;
  width?: number;
  imageFillType?: ImageFillType;
  className?: string;
  /** sizes attribute of the underlying img tag */
  sizes?: string;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
}

export const Image: React.FC<ImageProps> = ({
  image,
  aspectRatio,
  width,
  imageFillType,
  className,
  sizes,
  loading = "lazy",
  style,
}) => {
  // Calculate height based on width and aspect ratio if width is provided
  const calculatedHeight =
    width && aspectRatio ? width / aspectRatio : undefined;

  // Determine container styles based on whether width is specified
  const containerStyles = width
    ? `overflow-hidden` // No w-full when width is specified
    : `overflow-hidden w-full`; // Use w-full when no width specified

  const imageStyle: React.CSSProperties = {
    objectFit: imageFillType === "fit" ? "contain" : "cover",
    ...style,
  };
  const imageTransformations = {
    fit: imageFillType === "fit" ? ("contain" as const) : ("cover" as const),
  };

  return (
    <div
      className={themeManagerCn(containerStyles, className)}
      style={width ? { width: `${width}px` } : undefined}
    >
      {aspectRatio ? (
        <ImageComponent
          image={image}
          layout={"aspect"}
          aspectRatio={aspectRatio}
          className="object-cover w-full h-full"
          imgOverrides={{ sizes }}
          imageTransformations={imageTransformations}
          loading={loading}
          style={imageStyle}
        />
      ) : !!width && !!calculatedHeight ? (
        <ImageComponent
          image={image}
          layout={"fixed"}
          width={width}
          height={calculatedHeight}
          className="object-cover"
          imgOverrides={{ sizes }}
          imageTransformations={imageTransformations}
          loading={loading}
          style={imageStyle}
        />
      ) : (
        <img
          src={image.url}
          alt={image.alternateText}
          className="object-cover w-full h-full"
          loading={loading}
          style={imageStyle}
        />
      )}
    </div>
  );
};

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

  let maxWidth = getThemeValue(
    "--maxWidth-pageSection-contentWidth",
    streamDocument
  );
  if (!maxWidth && streamDocument?.__?.theme) {
    maxWidth = "1024px";
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
