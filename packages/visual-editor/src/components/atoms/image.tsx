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
