import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  Image,
  ImageProps,
} from "../../index.js";
import { ImageType } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface ImageWrapperProps {
  image: YextEntityField<any>;
  resize: ImageProps["resize"];
  aspectRatio: ImageProps["aspectRatio"];
  width?: ImageProps["width"];
}

const imageWrapperFields: Fields<ImageWrapperProps> = {
  image: YextEntityFieldSelector<any, ImageType>({
    label: "Image",
    filter: {
      types: ["type.image"],
    },
  }),
  resize: {
    label: "Size",
    type: "radio",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Fixed", value: "fixed" },
    ],
  },
  aspectRatio: BasicSelector("Aspect Ratio", [
    { label: "Auto", value: "auto" },
    { label: "Square", value: "square" },
    { label: "Video (16:9)", value: "video" },
    { label: "Portrait (3:4)", value: "portrait" },
  ]),
};

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image: imageField,
  resize,
  aspectRatio,
  width,
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
      <Image
        image={resolvedImage}
        resize={resize}
        aspectRatio={aspectRatio}
        width={width}
      />
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
        url: PLACEHOLDER_IMAGE_URL,
      },
      constantValueEnabled: true,
    },
    resize: "auto",
    aspectRatio: "auto",
    width: 640,
  },
  resolveFields(data) {
    if (data.props.resize === "fixed") {
      return {
        ...imageWrapperFields,
        width: {
          label: "Width",
          type: "number",
          min: 0,
        },
      };
    }
    return imageWrapperFields;
  },
  render: (props) => <ImageWrapper {...props} />,
};

export { ImageWrapperComponent as ImageWrapper, type ImageWrapperProps };
