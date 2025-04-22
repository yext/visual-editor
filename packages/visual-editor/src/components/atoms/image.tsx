import * as React from "react";
import {
  ComplexImageType,
  Image as ImageComponent,
  ImageType,
} from "@yext/pages-components";
import {
  resolveYextEntityField,
  themeManagerCn,
  useDocument,
  YextEntityField,
} from "@yext/visual-editor";

export interface ImageProps {
  image:
    | ImageType
    | ComplexImageType
    | YextEntityField<ImageType | ComplexImageType>;
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
  const resolvedImage = handleUnresolvedImage(image);
  if (!resolvedImage) {
    return;
  }

  return (
    <div className={themeManagerCn("overflow-hidden w-full", className)}>
      {layout === "auto" && aspectRatio ? (
        <ImageComponent
          image={resolvedImage}
          layout={"aspect"}
          aspectRatio={aspectRatio}
          className="object-cover w-full"
        />
      ) : (
        <ImageComponent
          image={resolvedImage}
          layout={"fixed"}
          width={width}
          height={height}
          className="object-cover"
        />
      )}
    </div>
  );
};

// if image is type YextEntityField<ImageType> | YextEntityField<ComplexImageType>, return the resolvedImage
const handleUnresolvedImage = (
  image: any
): ImageType | ComplexImageType | undefined => {
  if (image && "field" in image) {
    const document = useDocument();
    return resolveYextEntityField(document, image);
  }

  return image;
};
