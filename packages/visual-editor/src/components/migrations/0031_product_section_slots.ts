import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { ProductSectionProps } from "../pageSections/ProductSection/ProductSection";
import { ProductCardProps } from "../pageSections/ProductSection/ProductCard";
import { ProductCardsWrapperProps } from "../pageSections/ProductSection/ProductCardsWrapper";
import { HeadingTextProps } from "../contentBlocks/HeadingText";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { ProductSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { ImageWrapperProps } from "../contentBlocks/image/Image";
import { BodyTextProps } from "../contentBlocks/BodyText";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper";
import { resolveComponentData } from "../../utils/resolveComponentData";

export const productSectionSlots: Migration = {
  ProductSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean = props.data.constantValueEnabled;
      const products = resolveYextEntityField(
        streamDocument,
        props.data.products as YextEntityField<ProductSectionType>,
        streamDocument?.locale
      )?.products;

      const cards =
        products?.map((product, i) => {
          const resolvedName = product.name
            ? resolveComponentData(
                product.name,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          const resolvedCategory = product.category
            ? resolveComponentData(
                product.category,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";

          return {
            type: "ProductCard",
            props: {
              id: `${props.id}-Card-${i}`,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
              },
              slots: {
                ImageSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      data: {
                        image: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: product.image || {
                            url: "",
                            height: 360,
                            width: 640,
                          },
                        },
                      },
                      styles: {
                        width: 640,
                        aspectRatio: 16 / 9,
                      },
                      sizes: {
                        base: "calc(100vw - 32px)",
                        md: "calc((maxWidth - 32px) / 2)",
                        lg: "calc((maxWidth - 32px) / 3)",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            image: product.image,
                          },
                    } satisfies ImageWrapperProps,
                  },
                ],
                CategorySlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: product.category ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: product.category,
                          },
                    } satisfies BodyTextProps,
                  },
                ],
                TitleSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: product.name ?? "",
                        },
                      },
                      styles: {
                        level: props.styles.cards.headingLevel,
                        align: "left",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            text: resolvedName,
                          },
                    } satisfies HeadingTextProps,
                  },
                ],
                DescriptionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: product.description ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: product.description,
                          },
                    } satisfies BodyTextProps,
                  },
                ],
                CTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      data: {
                        entityField: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: {
                            label: product.cta?.label ?? "Learn More",
                            link: product.cta?.link ?? "#",
                            linkType: product.cta?.linkType ?? "URL",
                            ctaType: "textAndLink",
                          },
                        },
                      },
                      styles: {
                        variant: props.styles.cards.ctaVariant,
                        presetImage: "app-store",
                      },
                      eventName: `cta${i}`,
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            cta: product.cta,
                          },
                    } satisfies CTAWrapperProps,
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.field,
                    product,
                  },
              conditionalRender: {
                category: resolvedCategory !== "",
              },
            } satisfies WithId<ProductCardProps>,
          };
        }) || [];

      return {
        id: props.id,
        analytics: props.analytics,
        liveVisibility: props.liveVisibility,
        styles: {
          backgroundColor: props.styles.backgroundColor,
        },
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                data: {
                  text: {
                    field: props.data.heading.field,
                    constantValueEnabled:
                      props.data.heading.constantValueEnabled,
                    constantValue: props.data.heading.constantValue,
                  },
                },
                styles: props.styles.heading,
              } satisfies HeadingTextProps,
            },
          ],
          CardsWrapperSlot: [
            {
              type: "ProductCardsWrapper",
              props: {
                data: {
                  field: props.data.products.field,
                  constantValueEnabled:
                    props.data.products.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies ProductCardsWrapperProps,
            },
          ],
        },
      } satisfies WithId<ProductSectionProps>;
    },
  },
};
