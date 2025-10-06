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
  imgSizesHelper,
  resolveDataFromParent,
  AssetImageType,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { ImageStylingFields, ImageStylingProps } from "./styling.ts";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface ImageWrapperProps {
  data: {
    /** The image to display. */
    image: YextEntityField<ImageType | ComplexImageType | AssetImageType>;
  };

  /** Size and aspect ratio of the image. */
  styles: ImageStylingProps;

  /** @internal Controlled data from the parent section. */
  parentData?: {
    field: string;
    image: ImageType | ComplexImageType | AssetImageType;
  };

  /** Additional CSS classes to apply to the image. */
  className?: string;
}

export const ImageWrapperFields: Fields<ImageWrapperProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      image: YextField<any, ImageType | ComplexImageType | AssetImageType>(
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

const ImageWrapperComponent = ({
  data,
  styles,
  parentData,
  className,
}: ImageWrapperProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = parentData
    ? parentData.image
    : resolveComponentData(data.image, i18n.language, streamDocument);

  console.log("Resolved Image: ", resolvedImage);
  if (!resolvedImage) {
    return null;
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={parentData ? parentData.field : data.image.field}
      constantValueEnabled={!parentData && data.image.constantValueEnabled}
    >
      <div className="w-full">
        <Image
          image={resolvedImage}
          aspectRatio={styles.aspectRatio}
          width={styles.width}
          className={
            className || "max-w-full rounded-image-borderRadius w-full"
          }
          sizes={imgSizesHelper({
            base: styles.width ? `min(100vw, ${styles.width}px)` : "100vw",
            md: styles.width
              ? `min(${styles.width}px, calc((maxWidth - 32px) / 2))`
              : "maxWidth / 2",
          })}
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
  resolveFields: (data) => resolveDataFromParent(ImageWrapperFields, data),
  render: (props) => <ImageWrapperComponent {...props} />,
};
