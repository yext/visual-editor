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

  const imageDataUrl = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  ) as AssetImageType;

  if (!imageDataUrl?.url) {
    return puck.isEditing ? <div className="h-20" /> : <></>;
  }

  const width = styles.width || 100;
  const aspectRatio = styles.aspectRatio || 1.78;

  const imgElement = (
    <Image
      image={imageDataUrl}
      aspectRatio={aspectRatio}
      width={width}
      className="object-contain"
    />
  );

  const altText = imageDataUrl.alternateText;
  const ariaLabel =
    typeof altText === "string" ? altText : altText?.en || "Logo";

  const content = data.linkTarget ? (
    <MaybeLink href={data.linkTarget} className="block" aria-label={ariaLabel}>
      {imgElement}
    </MaybeLink>
  ) : (
    imgElement
  );

  return <div style={{ width: "fit-content" }}>{content}</div>;
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
        width: YextField(msg("fields.width", "Width"), {
          type: "number",
          min: 0,
        }),
        aspectRatio: YextField(msg("fields.aspectRatio", "Aspect Ratio"), {
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
      width: 0,
      aspectRatio: 1.78,
    },
  },
  render: (props) => <FooterLogoSlotInternal {...props} />,
};
