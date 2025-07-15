import * as React from "react";
import {
  ComplexImageType,
  Image as ImageComponent,
  ImageType,
} from "@yext/pages-components";
import { themeManagerCn } from "@yext/visual-editor";

export interface ImageProps {
  image: ImageType | ComplexImageType;
  aspectRatio?: number;
  width?: number;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export const Image: React.FC<ImageProps> = ({
  image,
  aspectRatio,
  width,
  className,
  role,
  "aria-label": ariaLabel,
}) => {
  // Calculate height based on width and aspect ratio if width is provided
  const calculatedHeight =
    width && aspectRatio ? width / aspectRatio : undefined;

  // Determine container styles based on whether width is specified
  const containerStyles = width
    ? `overflow-hidden` // No w-full when width is specified
    : `overflow-hidden w-full`; // Use w-full when no width specified

  return (
    <div className="w-full">
      <div
        className={themeManagerCn(containerStyles, className)}
        style={width ? { width: `${width}px` } : undefined}
        role={role}
        aria-label={ariaLabel}
      >
        {aspectRatio ? (
          <ImageComponent
            image={image}
            layout={"aspect"}
            aspectRatio={aspectRatio}
            className="object-cover w-full h-full"
          />
        ) : !!width && !!calculatedHeight ? (
          <ImageComponent
            image={image}
            layout={"fixed"}
            width={width}
            height={calculatedHeight}
            className="object-cover"
          />
        ) : (
          <img
            src={isComplexImageType(image) ? image.image.url : image.url}
            alt={
              isComplexImageType(image)
                ? (image.image.alternateText ?? "")
                : (image.alternateText ?? "")
            }
            className="object-cover w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

function isComplexImageType(
  image: ImageType | ComplexImageType
): image is ComplexImageType {
  return "image" in image;
}
