import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  AssetImageType,
  msg,
  MaybeLink,
  Image,
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

  const width = styles.width || 60;
  const aspectRatio = styles.aspectRatio || 1;

  // Filter to only valid images with URLs
  const validImages = (data.utilityImages || []).filter(
    (item) => item.image?.url
  );

  if (validImages.length === 0) {
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
  }

  return (
    <div className="flex gap-8" style={{ width: "fit-content" }}>
      {validImages.map((item, index) => {
        const imgElement = (
          <Image
            image={item.image}
            aspectRatio={aspectRatio}
            width={width}
            className="object-contain"
          />
        );

        const altText = item.image?.alternateText;
        const ariaLabel =
          typeof altText === "string"
            ? altText
            : altText?.en || `Utility Image ${index + 1}`;

        return (
          <div key={index}>
            {item.linkTarget ? (
              <MaybeLink
                href={item.linkTarget}
                className="block"
                aria-label={ariaLabel}
              >
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
  label: msg("components.footerUtilityImagesSlot", "Utility Images"),
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
      utilityImages: [],
    },
    styles: {
      width: 0,
      aspectRatio: 1,
    },
  },
  render: (props) => <FooterUtilityImagesSlotInternal {...props} />,
};
