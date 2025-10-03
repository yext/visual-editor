import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { Migration } from "../../utils/migrate.ts";
import { PromoSectionType } from "../../types/types.ts";

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

      return {
        ...props,
        slots: {
          HeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
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
                      text: resolvedPromo?.title || "",
                      field,
                    }
                  : undefined,
              },
            },
          ],
          DescriptionSlot: [
            {
              type: "BodyTextSlot",
              props: {
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
              },
            },
          ],
          VideoSlot: isVideo
            ? [
                {
                  type: "VideoSlot",
                  props: {
                    data: {
                      assetVideo: constantValue.image || {},
                    },
                  },
                },
              ]
            : [],
          ImageSlot: isVideo
            ? []
            : [
                {
                  type: "ImageWrapperSlot",
                  props: {
                    data: {
                      image: {
                        field,
                        constantValue: constantValue.image ?? {},
                        constantValueEnabled:
                          constantValueOverride.image ?? false,
                      },
                    },
                    styles: imageStyle,
                    className:
                      "max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full",
                    parentData: !constantValueOverride.title
                      ? {
                          field,
                          image: resolvedPromo?.image || "",
                        }
                      : undefined,
                  },
                },
              ],
          CTASlot: [
            {
              type: "CTAWrapperSlot",
              props: {
                data: {
                  entityField: {
                    field,
                    constantValue: constantValue.cta ?? {},
                    constantValueEnabled: constantValueOverride.cta ?? false,
                  },
                },
                styles: {
                  variant: ctaVariant,
                },
                parentData: !constantValueOverride.title
                  ? {
                      field,
                      cta: resolvedPromo?.cta || "",
                    }
                  : undefined,
              },
            },
          ],
        },
      };
    },
  },
};
