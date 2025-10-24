import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  AssetImageType,
  msg,
  useDocument,
  resolveComponentData,
  Image,
  ComplexImageType,
  MaybeLink,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface FooterLogoSlotProps {
  data: {
    image: {
      field: string;
      constantValue: AssetImageType;
      constantValueEnabled: boolean;
    };
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
  const { i18n } = useTranslation();

  const imageData = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  ) as AssetImageType;

  if (!imageData?.url) {
    return puck.isEditing ? <div className="h-20" /> : <></>;
  }

  const complexImage: ComplexImageType = {
    image: imageData,
    width: styles.width || 100,
  };

  const logo = (
    <Image
      image={complexImage}
      className="max-w-full h-auto"
      style={{
        aspectRatio: styles.aspectRatio || 1.78,
      }}
    />
  );

  if (data.linkTarget) {
    return (
      <MaybeLink href={data.linkTarget} className="block">
        {logo}
      </MaybeLink>
    );
  }

  return logo;
};

export const FooterLogoSlot: ComponentConfig<{ props: FooterLogoSlotProps }> = {
  label: msg("components.footerLogoSlot", "Footer Logo"),
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
        width: YextField(msg("fields.width", "Width"), {
          type: "number",
        }),
        aspectRatio: YextField(msg("fields.aspectRatio", "Aspect Ratio"), {
          type: "number",
        }),
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
      width: 100,
      aspectRatio: 1.78,
    },
  },
  render: (props) => <FooterLogoSlotInternal {...props} />,
};
