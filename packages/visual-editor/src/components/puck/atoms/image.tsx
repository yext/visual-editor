import * as React from "react";
import { Image as ImageComponent, ImageType } from "@yext/pages-components";
import { themeManagerCn } from "../../../index.ts";

export interface ImageProps {
  image: ImageType;
  layout: "auto" | "fixed";
  aspectRatio?: number;
  width?: number;
  height?: number;
}

export const Image: React.FC<ImageProps> = ({
  image,
  layout,
  aspectRatio,
  width,
  height,
}) => {
  return (
    <div className={themeManagerCn("overflow-hidden w-full")}>
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
