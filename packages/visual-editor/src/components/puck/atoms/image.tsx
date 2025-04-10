import * as React from "react";
import { Image as ImageComponent, ImageType } from "@yext/pages-components";
import { themeManagerCn } from "../../../index.ts";

export interface ImageProps {
  image: ImageType;
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
          className="object-cover w-full"
        />
      ) : (
        <ImageComponent
          image={image}
          layout={"fixed"}
          width={width}
          height={height}
          className="object-cover"
        />
      )}
    </div>
  );
};

// Handle ImageType or ComplexImageType
// TODO - Reconsider how this handled / why it isn't autoresolved
export const handleComplexImages = (resolvedImage: any) => {
  let image: ImageType;
  if (
    resolvedImage &&
    typeof resolvedImage === "object" &&
    "image" in resolvedImage
  ) {
    image = resolvedImage.image as ImageType;
  } else if (resolvedImage) {
    image = resolvedImage;
  } else {
    image = { height: 150, width: 150, url: "" };
  }
  return image;
};
