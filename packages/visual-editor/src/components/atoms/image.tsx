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
  height?: number;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  image,
  aspectRatio,
  width,
  height,
  className,
}) => {
  // Calculate height based on width and aspect ratio if width is provided
  const calculatedHeight = width && aspectRatio ? width / aspectRatio : height;

  return (
    <div className={themeManagerCn("overflow-hidden w-full", className)}>
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
          className="object-cover"
        />
      )}
    </div>
  );
};

function isComplexImageType(
  image: ImageType | ComplexImageType
): image is ComplexImageType {
  return "image" in image;
}
