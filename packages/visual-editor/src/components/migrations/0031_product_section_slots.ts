import { Migration } from "../../utils/migrate";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { ProductSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
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
                    },
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
                    },
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
                    },
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
                    },
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
                    },
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
            },
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
              },
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
              },
            },
          ],
        },
      };
    },
  },
};
