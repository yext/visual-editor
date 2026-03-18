import * as React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { AssetImageType } from "../../types/images.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { Image } from "../atoms/image.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { useTranslation } from "react-i18next";
import { ImageStylingFields } from "../contentBlocks/image/styling.ts";

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const width = styles.width || 60;
  const aspectRatio = styles.aspectRatio || 1;

  // Filter to only valid images with URLs
  const validImages = (data.utilityImages || [])
    .map(
      (item: { image?: AssetImageType; url?: string; linkTarget?: string }) => {
        if (item.image) {
          return item;
        }
        if (item.url) {
          return {
            image: {
              url: item.url,
            } as AssetImageType,
            linkTarget: item.linkTarget,
          };
        }
        return item;
      }
    )
    .filter(
      (item): item is { image: AssetImageType; linkTarget?: string } =>
        !!item.image?.url ||
        (typeof item.image === "object" && "hasLocalizedValue" in item.image)
    );

  if (validImages.length === 0) {
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
  }

  return (
    <div className="flex gap-0 md:grid md:grid-cols-3 md:gap-8">
      {validImages.map((item, index) => {
        const imgElement = (
          <Image
            image={item.image}
            aspectRatio={aspectRatio}
            width={width}
            className="object-contain"
          />
        );

        const altText = resolveComponentData(
          item.image?.alternateText ?? "",
          locale,
          streamDocument
        );
        const ariaLabel =
          altText ||
          t(
            "components.footerUtilityImagesSlot.defaultAlt",
            "Utility Image {{number}}",
            {
              number: index + 1,
            }
          );

        return (
          <div key={index}>
            {item.linkTarget ? (
              <MaybeLink
                href={item.linkTarget}
                className="block"
                ariaLabel={ariaLabel}
                alwaysHideCaret={true}
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
  label: msg("components.footerUtilityImagesSlotLabel", "Utility Images"),
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
              pt("utilityImage", "Utility Image") + " " + ((index ?? 0) + 1),
          }
        ),
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
      utilityImages: [],
    },
    styles: {
      width: 0,
      aspectRatio: 1,
    },
  },
  render: (props) => <FooterUtilityImagesSlotInternal {...props} />,
};
