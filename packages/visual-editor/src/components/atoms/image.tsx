import * as React from "react";
import {
  ComplexImageType,
  Image as ImageComponent,
  ImageType,
} from "@yext/pages-components";
import { themeManagerCn } from "@yext/visual-editor";

export interface ImageProps {
  image: ImageType | ComplexImageType;
  layout: "auto" | "fixed";
  aspectRatio?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  image,
  layout,
  aspectRatio,
  width,
  height,
  className,
}) => {
  return (
    <div className={themeManagerCn("overflow-hidden w-full", className)}>
      {layout === "auto" && aspectRatio ? (
        <ImageComponent
          image={image}
          layout={"aspect"}
          aspectRatio={aspectRatio}
          className="object-cover w-full h-full"
        />
      ) : !!width && !!height ? (
        <ImageComponent
          image={image}
          layout={"fixed"}
          width={width}
          height={height}
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
