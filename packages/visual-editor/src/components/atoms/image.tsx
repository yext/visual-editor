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
}

export const Image: React.FC<ImageProps> = ({
  image,
  aspectRatio,
  width,
  className,
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
        />
      ) : !!width && !!calculatedHeight ? (
        <ImageComponent
          image={{ ...image, alternateText: altText }}
          layout={"fixed"}
          width={width}
          height={calculatedHeight}
          className="object-cover"
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
