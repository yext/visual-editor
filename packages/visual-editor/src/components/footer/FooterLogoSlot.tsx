import * as React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { AssetImageType, TranslatableAssetImage } from "../../types/images.ts";
import { msg } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { getImageAltText, Image } from "../atoms/image.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { useTranslation } from "react-i18next";
import { ImageStylingFields } from "../contentBlocks/image/styling.ts";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { getImageUrl } from "../contentBlocks/image/Image.tsx";
import { defaultText } from "../../utils/i18n/defaultContent.ts";

export interface FooterLogoSlotProps {
  data: {
    image: YextEntityField<
      ImageType | ComplexImageType | AssetImageType | TranslatableAssetImage
    >;
    linkTarget?: string;
  };
  styles: {
    width?: number;
    aspectRatio?: number;
  };
}

const FooterLogoSlotInternal: PuckComponent<FooterLogoSlotProps> = (props) => {
  const { data, styles, puck } = props;
  const streamDocument = useDocument();
  const { i18n, t } = useTranslation();

  const resolvedImage:
    | ImageType
    | ComplexImageType
    | TranslatableAssetImage
    | undefined = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  );
  const simplifiedImage: ImageType | AssetImageType | undefined =
    resolvedImage && "image" in resolvedImage
      ? resolvedImage.image
      : resolvedImage && "hasLocalizedValue" in resolvedImage
        ? resolvedImage[i18n.language]
        : resolvedImage;

  const imageUrl = getImageUrl(simplifiedImage, i18n.language);

  if (!simplifiedImage || !imageUrl) {
    return puck.isEditing ? <div className="h-20 w-[100px]" /> : <></>;
  }

  const width = styles.width || 150;
  const aspectRatio = styles.aspectRatio || 1.78;

  const imgElement = (
    <Image
      image={simplifiedImage}
      aspectRatio={aspectRatio}
      width={width}
      className="object-contain"
    />
  );

  const altText = getImageAltText(
    simplifiedImage,
    i18n.language,
    streamDocument
  );
  const ariaLabel = altText || t("logo", "Logo");

  return (
    <div className="w-fit">
      <MaybeLink
        href={data.linkTarget}
        className="block"
        ariaLabel={ariaLabel}
        alwaysHideCaret={true}
      >
        {imgElement}
      </MaybeLink>
    </div>
  );
};

export const FooterLogoSlot: ComponentConfig<{ props: FooterLogoSlotProps }> = {
  label: msg("components.footerLogoSlot", "Logo"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        image: YextField(msg("fields.image", "Image"), {
          type: "entityField",
          filter: {
            types: ["type.image"],
          },
        }),
        linkTarget: YextField(msg("fields.linkTarget", "Link Target"), {
          type: "text",
        }),
      },
    }),
    styles: YextField(msg("fields.styles", "Styles"), {
      type: "object",
      objectFields: {
        width: ImageStylingFields.width,
        aspectRatio: ImageStylingFields.aspectRatio as any,
      },
    }),
  },
  defaultProps: {
    data: {
      image: {
        field: "",
        constantValue: {
          // Placeholder logo, uploaded to account 4174974
          url: "https://a.mktgcdn.com/p/wa83C1O1lvtxHI9cGqEdP2HILyUzbD0jvtzwWpOAJfE/196x196.jpg",
          height: 100,
          width: 100,
          alternateText: defaultText("componentDefaults.logo", "Logo"),
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      width: 0,
      aspectRatio: 1,
    },
  },
  render: (props) => <FooterLogoSlotInternal {...props} />,
};
