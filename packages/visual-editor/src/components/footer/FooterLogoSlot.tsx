import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  AssetImageType,
  msg,
  useDocument,
  resolveComponentData,
  MaybeLink,
  Image,
  YextEntityField,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { ImageStylingFields } from "../contentBlocks/image/styling";

export interface FooterLogoSlotProps {
  data: {
    image: YextEntityField<AssetImageType>;
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

  const imageDataUrl = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  ) as AssetImageType;

  if (!imageDataUrl?.url) {
    return puck.isEditing ? <div className="h-20" /> : <></>;
  }

  const width = styles.width || 150;
  const aspectRatio = styles.aspectRatio || 1.78;

  const imgElement = (
    <Image
      image={imageDataUrl}
      aspectRatio={aspectRatio}
      width={width}
      className="object-contain"
    />
  );

  const altText = resolveComponentData(
    imageDataUrl.alternateText ?? "",
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
          type: "image",
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
          url: "https://placehold.co/100",
          height: 100,
          width: 100,
          alternateText: { en: "Logo", hasLocalizedValue: "true" },
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      width: 0,
      aspectRatio: 1.78,
    },
  },
  render: (props) => <FooterLogoSlotInternal {...props} />,
};
