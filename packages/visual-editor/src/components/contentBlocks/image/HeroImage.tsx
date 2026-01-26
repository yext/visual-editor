import * as React from "react";
import { useTranslation } from "react-i18next";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  Image,
  msg,
  pt,
  imgSizesHelper,
  AssetImageType,
  TranslatableAssetImage,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { updateFields } from "../../pageSections/HeroSection";
import {
  imageDefaultProps,
  ImageWrapperFields,
  ImageWrapperProps,
} from "./Image.tsx";
import { EmptyImageState } from "./EmptyImageState";

export interface HeroImageProps extends ImageWrapperProps {
  /** @internal from the parent Hero Section Component */
  variant?: "classic" | "compact" | "immersive" | "spotlight";
}

const HeroImageComponent: PuckComponent<HeroImageProps> = (props) => {
  const { data, styles, className, puck, variant } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  );

  const getImageUrl = (
    image: ImageType | ComplexImageType | TranslatableAssetImage | undefined
  ): string | undefined => {
    if (!image) {
      return undefined;
    }

    if ("hasLocalizedValue" in image) {
      const localized = image[i18n.language];
      if (typeof localized === "object") {
        return localized.url;
      }
      return undefined;
    }

    if ("image" in image) {
      return image.image?.url;
    }
    return (image as ImageType | AssetImageType).url;
  };

  const imageUrl = getImageUrl(resolvedImage);
  const isEmpty =
    !resolvedImage ||
    !imageUrl ||
    (typeof imageUrl === "string" && imageUrl.trim() === "");

  if (isEmpty) {
    return (
      <EmptyImageState
        isEmpty={isEmpty}
        isEditing={puck?.isEditing ?? false}
        constantValueEnabled={data.image.constantValueEnabled ?? false}
        constantValue={data.image.constantValue as AssetImageType | undefined}
        fieldId={data.image.field}
        containerStyle={{ minHeight: "250px" }}
        containerClassName={
          className || "max-w-full rounded-image-borderRadius w-full h-full"
        }
        fullHeight={true}
        hasParentData={false}
      />
    );
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={data.image.field}
      constantValueEnabled={data.image.constantValueEnabled}
      fullHeight={true}
    >
      <Image
        image={resolvedImage}
        aspectRatio={styles.aspectRatio}
        width={variant === "classic" ? styles.width : undefined}
        className={className || "max-w-full rounded-image-borderRadius w-full"}
        sizes={imgSizesHelper({
          base: "calc(100vw - 32px)",
          md: "calc(maxWidth / 2)",
        })}
        loading="eager"
      />
    </EntityField>
  );
};

export const HeroImage: ComponentConfig<{ props: HeroImageProps }> = {
  label: msg("components.heroImage", "Hero Image"),
  fields: ImageWrapperFields,
  defaultProps: imageDefaultProps,
  resolveFields: (data) => {
    let fields = ImageWrapperFields;

    switch (data.props.variant ?? "classic") {
      case "compact": {
        fields = updateFields(fields, ["styles.objectFields.width"], undefined);
        // compact should also remove the props removed by classic
      }
      case "classic": {
        fields = updateFields(
          fields,
          ["styles.objectFields.aspectRatio.options"],
          // @ts-expect-error ts(2339) objectFields exists
          fields.styles.objectFields.aspectRatio.options.filter(
            (option: { label: string; value: string }) =>
              !["4:1", "3:1", "2:1", "9:16"].includes(option.label)
          )
        );
        break;
      }
    }
    return fields;
  },
  render: (props) => <HeroImageComponent {...props} />,
};
