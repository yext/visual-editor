import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { Migration } from "../../utils/migrate.ts";
import { PromoSectionType } from "../../types/types.ts";
import { ImageWrapperProps } from "../contentBlocks/image/Image.tsx";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";
import { BodyTextProps } from "../contentBlocks/BodyText.tsx";
import { VideoProps } from "../contentBlocks/Video.tsx";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { WithId } from "@measured/puck";

export const promoSectionSlots: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const resolvedPromo = resolveYextEntityField<PromoSectionType>(
        streamDocument,
        props.data.promo
      );

      const field = props.data.promo?.field ?? "";
      const constantValue = props.data.promo?.constantValue;
      const constantValueEnabled =
        props.data.promo?.constantValueEnabled ?? true;
      const constantValueOverride =
        props.data.promo?.constantValueOverride ?? {};

      const isVideo =
        !constantValueEnabled &&
        !constantValueOverride.image &&
        constantValue?.image.video;

      const imageStyle = props.styles.image;
      const headingStyle = props.styles.heading;
      const ctaVariant = props.styles.ctaVariant;

      props.data.promo.constantValue = {};
      props.data.promo.constantValueEnabled =
        !props.data.promo.constantValueOverride.title ||
        !props.data.promo.constantValueOverride.description ||
        !props.data.promo.constantValueOverride.image ||
        !props.data.promo.constantValueOverride.cta;

      delete props.styles.heading;
      delete props.data.promo.constantValueOverride;
      delete props.styles.imageStyle;
      delete props.styles.heading;
      delete props.styles.ctaVariant;

      const resolvedTitle = resolvedPromo?.title
        ? resolveComponentData(
            resolvedPromo.title,
            streamDocument.locale ?? "en",
            streamDocument
          )
        : "";

      return {
        ...props,
        slots: {
          HeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-HeadingSlot`,
                data: {
                  text: {
                    field,
                    constantValue: constantValue.title ?? "",
                    constantValueEnabled: constantValueOverride.title ?? false,
                  },
                },
                styles: headingStyle,
                parentData: !constantValueOverride.title
                  ? {
                      text: resolvedTitle,
                      field,
                    }
                  : undefined,
              } satisfies WithId<HeadingTextProps>,
            },
          ],
          DescriptionSlot: [
            {
              type: "BodyTextSlot",
              props: {
                id: `${props.id}-DescriptionSlot`,
                data: {
                  text: {
                    field,
                    constantValue: constantValue.description ?? "",
                    constantValueEnabled:
                      constantValueOverride.description ?? false,
                  },
                },
                styles: {
                  variant: "base",
                },
                parentData: !constantValueOverride.description
                  ? {
                      richText: resolvedPromo?.description || "",
                      field,
                    }
                  : undefined,
              } satisfies WithId<BodyTextProps>,
            },
          ],
          VideoSlot: isVideo
            ? [
                {
                  type: "VideoSlot",
                  props: {
                    id: `${props.id}-VideoSlot`,
                    data: {
                      assetVideo:
                        "video" in constantValue.image
                          ? constantValue.image
                          : {},
                    },
                  } satisfies WithId<VideoProps>,
                },
              ]
            : [],
          ImageSlot: isVideo
            ? []
            : [
                {
                  type: "ImageSlot",
                  props: {
                    id: `${props.id}-ImageSlot`,
                    data: {
                      image: {
                        field,
                        constantValue: constantValue.image ?? {},
                        constantValueEnabled:
                          constantValueOverride.image ?? false,
                      },
                    },
                    styles: {
                      aspectRatio: imageStyle?.aspectRatio ?? "1.78",
                      width: imageStyle?.width ?? 640,
                    },
                    className:
                      "max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full",
                    parentData: !constantValueOverride.image
                      ? {
                          field,
                          image:
                            resolvedPromo?.image &&
                            !("video" in resolvedPromo.image)
                              ? resolvedPromo.image
                              : {
                                  url: "https://placehold.co/640x360",
                                  height: 360,
                                  width: 640,
                                },
                        }
                      : undefined,
                    sizes: {
                      base: "calc(100vw - 32px)",
                      md: "min(width, 450px)",
                      lg: "width",
                    },
                  } satisfies WithId<ImageWrapperProps>,
                },
              ],
          CTASlot: [
            {
              type: "CTASlot",
              props: {
                id: `${props.id}-CTASlot`,
                data: {
                  entityField: {
                    field,
                    constantValue: constantValue.cta ?? {},
                    constantValueEnabled: constantValueOverride.cta ?? false,
                    selectedType: "type.cta",
                  },
                },
                styles: {
                  presetImage: constantValue.cta?.presetImageType,
                  variant: ctaVariant,
                },
                parentData: !constantValueOverride.cta
                  ? {
                      field,
                      cta: resolvedPromo?.cta || {
                        label: {
                          en: "Call to Action",
                          hasLocalizedValue: "true",
                        },
                        link: "#",
                        linkType: "URL",
                        ctaType: "textAndLink",
                      },
                    }
                  : undefined,
                eventName: "cta",
              } satisfies WithId<CTAWrapperProps>,
            },
          ],
        },
      };
    },
  },
};
