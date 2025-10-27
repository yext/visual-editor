import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import { YextField, AssetImageType, msg, MaybeLink } from "@yext/visual-editor";

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
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
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

        const altText =
          typeof imageData.alternateText === "string"
            ? imageData.alternateText
            : imageData.alternateText?.en || "Utility Image";

        const imgElement = (
          <img
            src={imageData.url}
            alt={altText}
            className="w-full h-full object-contain"
          />
        );

        return (
          <div
            key={index}
            style={{
              width: `${styles.width || 60}px`,
              aspectRatio: String(styles.aspectRatio || 1),
            }}
            className="max-w-full"
          >
            {item.linkTarget ? (
              <MaybeLink href={item.linkTarget} className="block w-full h-full">
                {imgElement}
              </MaybeLink>
            ) : (
              imgElement
            )}
          </div>
        );
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
