import * as React from "react";
import { Image as ImageComponent, ImageType } from "@yext/pages-components";
import { cva, VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../../index.ts";

export const imageVariants = cva("", {
  variants: {
    aspectRatio: {
      auto: "aspect-auto",
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
    },
  },
  defaultVariants: {
    aspectRatio: "auto",
  },
});

export interface ImageProps extends VariantProps<typeof imageVariants> {
  image: ImageType;
  resize: "auto" | "fixed";
  width?: number;
}

export const Image: React.FC<ImageProps> = ({
  image,
  resize,
  aspectRatio,
  width,
}) => {
  return (
    <div
      className={themeManagerCn(
        imageVariants({ aspectRatio }),
        "overflow-hidden"
      )}
      style={{ width: resize === "auto" ? "auto" : `${width}px` }}
    >
      <ImageComponent image={image} className="w-full h-full object-cover" />
    </div>
  );
};
