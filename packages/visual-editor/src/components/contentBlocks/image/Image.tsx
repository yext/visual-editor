import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  Image,
  YextField,
  msg,
  pt,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { ImageStylingFields, ImageStylingProps } from "./styling.ts";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface ImageWrapperProps {
  data: {
    image: YextEntityField<ImageType | ComplexImageType>;
  };
  styles: ImageStylingProps;
}

export const ImageWrapperFields: Fields<ImageWrapperProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      image: YextField<any, ImageType | ComplexImageType>(
        msg("fields.options.image", "Image"),
        {
          type: "entityField",
          filter: {
            types: ["type.image"],
          },
        }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      ...ImageStylingFields,
    },
  }),
};

const ImageWrapperComponent = ({ data, styles }: ImageWrapperProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  );

  if (!resolvedImage) {
    return null;
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={data.image.field}
      constantValueEnabled={data.image.constantValueEnabled}
    >
      <div className="w-full">
        <Image
          image={resolvedImage}
          aspectRatio={styles.aspectRatio}
          width={styles.width}
          className="max-w-full rounded-image-borderRadius w-full"
        />
      </div>
    </EntityField>
  );
};

export const ImageWrapper: ComponentConfig<{ props: ImageWrapperProps }> = {
  label: msg("components.image", "Image"),
  fields: ImageWrapperFields,
  defaultProps: {
    data: {
      image: {
        field: "",
        constantValue: {
          url: PLACEHOLDER_IMAGE_URL,
          height: 360,
          width: 640,
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      aspectRatio: 1.78,
      width: 640,
    },
  },
  render: (props) => <ImageWrapperComponent {...props} />,
};

export const ImageWrapperLocked: ComponentConfig<{ props: ImageWrapperProps }> =
  {
    ...ImageWrapper,
    permissions: {
      drag: false,
      duplicate: false,
      delete: false,
      edit: true,
      insert: false,
    },
  };
