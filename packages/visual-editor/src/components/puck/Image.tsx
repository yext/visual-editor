import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Image, ImageProps, ImageType } from "@yext/pages-components";
import { cva, type VariantProps } from "class-variance-authority";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
} from "../../index.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

const imageWrapperVariants = cva("", {
  variants: {
    size: {
      small: "max-w-xs",
      medium: "max-w-md",
      large: "max-w-xl",
      full: "w-full",
    },
    aspectRatio: {
      auto: "aspect-auto",
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
    },
    rounded: {
      none: "",
      small: "rounded-sm",
      medium: "rounded-md",
      large: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    size: "medium",
    aspectRatio: "auto",
    rounded: null,
  },
});

interface ImageWrapperProps extends VariantProps<typeof imageWrapperVariants> {
  image: YextEntityField<ImageType>;
}

const imageWrapperFields: Fields<ImageWrapperProps> = {
  image: YextEntityFieldSelector<any, ImageType>({
    label: "Image",
    filter: {
      types: ["type.image"],
    },
  }),
  size: BasicSelector("Size", [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
    { label: "Full Width", value: "full" },
  ]),
  aspectRatio: BasicSelector("Aspect Ratio", [
    { label: "Auto", value: "auto" },
    { label: "Square", value: "square" },
    { label: "Video (16:9)", value: "video" },
    { label: "Portrait (3:4)", value: "portrait" },
  ]),
  rounded: BasicSelector("Rounded Corners", [
    { label: "None", value: "none" },
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
    { label: "Full", value: "full" },
  ]),
};

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image: imageField,
  size,
  aspectRatio,
  rounded,
}) => {
  const document = useDocument();
  const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
    document,
    imageField
  );

  if (!resolvedImage) {
    return null;
  }

  return (
    <EntityField
      displayName="Image"
      fieldId={imageField.field}
      constantValueEnabled={imageField.constantValueEnabled}
    >
      <div
        className={themeManagerCn(
          imageWrapperVariants({ size, aspectRatio, rounded }),
          "overflow-hidden"
        )}
      >
        <Image image={resolvedImage} className="w-full h-full object-cover" />
      </div>
    </EntityField>
  );
};

const ImageWrapperComponent: ComponentConfig<ImageWrapperProps> = {
  label: "Image",
  fields: imageWrapperFields,
  defaultProps: {
    image: {
      field: "primaryPhoto",
      constantValue: {
        alternateText: "",
        height: 360,
        width: 640,
        url: PLACEHOLDER_IMAGE_URL,
      },
      constantValueEnabled: true,
    },
    size: "medium",
    aspectRatio: "auto",
    rounded: "none",
  },
  render: (props) => <ImageWrapper {...props} />,
};

export {
  ImageWrapperComponent as ImageWrapper,
  type ImageWrapperProps,
  imageWrapperVariants,
};
