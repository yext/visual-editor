import * as React from "react";
import {
  ComplexImageType,
  Image as ImageComponent,
  ImageType,
} from "@yext/pages-components";
import {
  resolveComponentData,
  themeManagerCn,
  useDocument,
  AssetImageType,
  TranslatableString,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface ImageProps {
  image: ImageType | ComplexImageType | AssetImageType;
  aspectRatio?: number;
  width?: number;
  className?: string;
  /** sizes attribute of the underlying img tag */
  sizes?: string;
}

export const Image: React.FC<ImageProps> = ({
  image,
  aspectRatio,
  width,
  className,
  sizes,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  // Calculate height based on width and aspect ratio if width is provided
  const calculatedHeight =
    width && aspectRatio ? width / aspectRatio : undefined;

  // Determine container styles based on whether width is specified
  const containerStyles = width
    ? `overflow-hidden` // No w-full when width is specified
    : `overflow-hidden w-full`; // Use w-full when no width specified

  let altTextField: string | TranslatableString | undefined = undefined;
  if (isComplexImageType(image)) {
    altTextField = image.image.alternateText;
  } else if (image?.alternateText) {
    altTextField = image.alternateText;
  }

  const altText =
    typeof altTextField === "object"
      ? resolveComponentData(altTextField, i18n.language, streamDocument)
      : altTextField;

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
        />
      ) : !!width && !!calculatedHeight ? (
        <ImageComponent
          image={{ ...image, alternateText: altText }}
          layout={"fixed"}
          width={width}
          height={calculatedHeight}
          className="object-cover"
          imgOverrides={{ sizes }}
        />
      ) : (
        <img
          src={isComplexImageType(image) ? image.image.url : image.url}
          alt={altText}
          className="object-cover w-full h-full"
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

type ImgSizesByBreakpoint = {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  "2xl"?: string;
};

/**
 * Creates a img sizes attribute based on the default Tailwind breakpoints.
 * Replaces `maxWidth` with the current page section max width from the theme.
 * @param sizes - the width of the image at different breakpoints
 * @returns a string for the sizes attribute of an img tag
 */
export const imgSizesHelper = (sizes: ImgSizesByBreakpoint): string => {
  const { streamDocument } = useDocument();

  let maxWidth = undefined;

  // Get the page section max with from the CSS variables (editor)
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
      maxWidth = JSON.parse(streamDocument.__.theme)?.[
        "--maxWidth-pageSection-contentWidth"
      ];
    }
  } catch {
    // use fallback max width
  }

  const finalSizes = Object.fromEntries(
    Object.entries(sizes).map(([key, value]) => [
      key,
      value.replace("maxWidth", maxWidth || "1440px"),
    ])
  );

  let s = finalSizes.base;
  if (finalSizes.sm) {
    s = `(min-width: 640px) ${finalSizes.sm}, ` + s;
  }
  if (finalSizes.md) {
    s = `(min-width: 768px) ${finalSizes.md}, ` + s;
  }
  if (finalSizes.lg) {
    s = `(min-width: 1024px) ${finalSizes.lg}, ` + s;
  }
  if (finalSizes.xl) {
    s = `(min-width: 1280px) ${finalSizes.xl}, ` + s;
  }
  if (finalSizes["2xl"]) {
    s = `(min-width: 1536px) ${finalSizes["2xl"]}, ` + s;
  }
  return s;
};
