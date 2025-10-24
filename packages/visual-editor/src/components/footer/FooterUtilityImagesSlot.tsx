import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  AssetImageType,
  msg,
  Image,
  ComplexImageType,
  MaybeLink,
} from "@yext/visual-editor";

export interface FooterUtilityImagesSlotProps {
  data: {
    utilityImages: { image: AssetImageType; linkTarget?: string }[];
  };
  styles: {
    width?: number;
    aspectRatio?: number;
  };
}

const FooterUtilityImagesSlotInternal: PuckComponent<
  FooterUtilityImagesSlotProps
> = (props) => {
  const { data, styles, puck } = props;

  if (!data.utilityImages || data.utilityImages.length === 0) {
    return puck.isEditing ? <div className="h-10" /> : <></>;
  }

  return (
    <div className="grid grid-cols-3 gap-8">
      {data.utilityImages.map((item, index) => {
        const imageData = item.image;

        if (!imageData?.url) {
          return puck.isEditing ? (
            <div key={index} className="h-10 w-10 bg-gray-200" />
          ) : null;
        }

        const complexImage: ComplexImageType = {
          image: imageData,
          width: styles.width || 60,
        };

        const image = (
          <Image
            key={index}
            image={complexImage}
            className="max-w-full h-auto"
            style={{
              aspectRatio: styles.aspectRatio || 1,
            }}
          />
        );

        if (item.linkTarget) {
          return (
            <MaybeLink key={index} href={item.linkTarget} className="block">
              {image}
            </MaybeLink>
          );
        }

        return image;
      })}
    </div>
  );
};

export const FooterUtilityImagesSlot: ComponentConfig<{
  props: FooterUtilityImagesSlotProps;
}> = {
  label: msg("components.footerUtilityImagesSlot", "Footer Utility Images"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        utilityImages: YextField(
          msg("fields.utilityImages", "Utility Images"),
          {
            type: "array",
            arrayFields: {
              image: YextField(msg("fields.image", "Image"), {
                type: "image",
              }),
              linkTarget: YextField(msg("fields.linkTarget", "Link Target"), {
                type: "text",
              }),
            },
            getItemSummary: (item, index) =>
              `Utility Image ${(index ?? 0) + 1}`,
          }
        ),
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
      utilityImages: [],
    },
    styles: {
      width: 60,
      aspectRatio: 1,
    },
  },
  render: (props) => <FooterUtilityImagesSlotInternal {...props} />,
};
