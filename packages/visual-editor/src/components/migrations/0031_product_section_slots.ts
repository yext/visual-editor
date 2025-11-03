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
      const constantValueEnabled: boolean =
        props.data.products.constantValueEnabled;
      const products = resolveYextEntityField(
        streamDocument,
        props.data.products as YextEntityField<ProductSectionType>,
        streamDocument?.locale || "en"
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
          const cardId = `${props.id}-Card-${i}`;

          return {
            type: "ProductCard",
            props: {
              id: cardId,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
              },
              slots: {
                ImageSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: `${cardId}-ImageSlot`,
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
                    } satisfies WithId<ImageWrapperProps>,
                  },
                ],
                CategorySlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-CategorySlot`,
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
                    } satisfies WithId<BodyTextProps>,
                  },
                ],
                TitleSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      id: `${cardId}-TitleSlot`,
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
                    } satisfies WithId<HeadingTextProps>,
                  },
                ],
                DescriptionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-DescriptionSlot`,
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
                    } satisfies WithId<BodyTextProps>,
                  },
                ],
                CTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: `${cardId}-CTASlot`,
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
                    } satisfies WithId<CTAWrapperProps>,
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
                id: `${props.id}-HeadingSlot`,
                data: {
                  text: {
                    field: props.data.heading.field,
                    constantValueEnabled:
                      props.data.heading.constantValueEnabled,
                    constantValue: props.data.heading.constantValue,
                  },
                },
                styles: props.styles.heading,
              } satisfies WithId<HeadingTextProps>,
            },
          ],
          CardsWrapperSlot: [
            {
              type: "ProductCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  field: props.data.products.field,
                  constantValueEnabled:
                    props.data.products.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies WithId<ProductCardsWrapperProps>,
            },
          ],
        },
      } satisfies WithId<ProductSectionProps>;
    },
  },
};
