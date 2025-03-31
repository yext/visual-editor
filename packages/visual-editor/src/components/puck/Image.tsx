import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  Image,
  ImageProps,
} from "../../index.js";
import { ImageType } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface ImageWrapperProps {
  image: YextEntityField<ImageType>;
  layout: ImageProps["layout"];
  aspectRatio?: ImageProps["aspectRatio"];
  width?: ImageProps["width"];
  height?: ImageProps["height"];
}

const ImageWrapperFields: Fields<ImageWrapperProps> = {
  image: YextEntityFieldSelector<any, ImageType>({
    label: "Image",
    filter: {
      types: ["type.image"],
    },
  }),
  layout: {
    label: "Layout",
    type: "radio",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Fixed", value: "fixed" },
    ],
  },
  width: {
    label: "Width",
    type: "number",
    min: 0,
  },
  height: {
    label: "Height",
    type: "number",
    min: 0,
  },
  aspectRatio: {
    label: "Aspect Ratio",
    type: "select",
    options: [
      { label: "1:1", value: 1 },
      { label: "5:4", value: 1.25 },
      { label: "4:3", value: 1.33 },
      { label: "3:2", value: 1.5 },
      { label: "5:3", value: 1.67 },
      { label: "16:9", value: 1.78 },
      { label: "2:1", value: 2 },
      { label: "3:1", value: 3 },
      { label: "4:1", value: 4 },
      { label: "4:5", value: 0.8 },
      { label: "3:4", value: 0.75 },
      { label: "2:3", value: 0.67 },
      { label: "3:5", value: 0.6 },
      { label: "9:16", value: 0.56 },
      { label: "1:2", value: 0.5 },
      { label: "1:3", value: 0.33 },
      { label: "1:4", value: 0.25 },
    ],
  },
};

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image: imageField,
  layout,
  aspectRatio,
  width,
  height,
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
        layout={layout}
        aspectRatio={aspectRatio}
        width={width}
        height={height}
      />
    </EntityField>
  );
};

const resolvedImageFields = (layout: "auto" | "fixed") => {
  return {
    image: ImageWrapperFields["image"],
    layout: ImageWrapperFields["layout"],
    ...(layout === "auto"
      ? {
          aspectRatio: ImageWrapperFields["aspectRatio"],
        }
      : {
          height: ImageWrapperFields["height"],
          width: ImageWrapperFields["width"],
        }),
  };
};

const ImageWrapperComponent: ComponentConfig<ImageWrapperProps> = {
  label: "Image",
  fields: ImageWrapperFields,
  defaultProps: {
    image: {
      field: "primaryPhoto",
      constantValue: {
        url: PLACEHOLDER_IMAGE_URL,
        height: 360,
        width: 640,
      },
      constantValueEnabled: true,
    },
    layout: "auto",
    aspectRatio: 1.78,
  },
  resolveFields(data) {
    return resolvedImageFields(data.props.layout);
  },
  render: (props) => <ImageWrapper {...props} />,
};

export {
  ImageWrapperComponent as ImageWrapper,
  type ImageWrapperProps,
  ImageWrapperFields,
  resolvedImageFields,
};
