import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { InsightSectionProps } from "../pageSections/InsightSection/InsightSection";
import { InsightCardProps } from "../pageSections/InsightSection/InsightCard";
import { InsightCardsWrapperProps } from "../pageSections/InsightSection/InsightCardsWrapper";
import { HeadingTextProps } from "../contentBlocks/HeadingText";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { InsightSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { ImageWrapperProps } from "../contentBlocks/image/Image";
import { BodyTextProps } from "../contentBlocks/BodyText";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper";
import { resolveComponentData } from "../../utils/resolveComponentData";
import { TimestampProps } from "../contentBlocks/Timestamp";

export const insightSectionSlots: Migration = {
  InsightSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean =
        props.data.insights.constantValueEnabled;
      const insights = resolveYextEntityField(
        streamDocument,
        props.data.insights as YextEntityField<InsightSectionType>,
        streamDocument.meta?.locale || "en"
      )?.insights;

      const cards =
        insights?.map((insight, i) => {
          const resolvedName = insight.name
            ? resolveComponentData(
                insight.name,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          const cardId = `${props.id}-Card-${i}`;
          return {
            type: "InsightCard",
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
                          constantValue: insight.image || {
                            url: "",
                            height: 360,
                            width: 640,
                          },
                        },
                      },
                      styles: {
                        width: insight.image?.width || 640,
                        aspectRatio:
                          insight.image?.width && insight.image?.height
                            ? insight.image.width / insight.image.height
                            : 16 / 9,
                      },
                      className: "max-w-full h-full object-cover",
                      sizes: {
                        base: "calc(100vw - 32px)",
                        lg: "calc(maxWidth * 0.45)",
                      },
                      hideWidthProp: true,
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            image: insight.image,
                          },
                    } satisfies WithId<ImageWrapperProps>,
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
                          constantValue: insight.name ?? "",
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
                CategorySlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-CategorySlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: insight.category ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: insight.category,
                          },
                    } satisfies WithId<BodyTextProps>,
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
                          constantValue: insight.description ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: insight.description,
                          },
                    } satisfies WithId<BodyTextProps>,
                  },
                ],
                PublishTimeSlot: [
                  {
                    type: "Timestamp",
                    props: {
                      id: `${cardId}-PublishTimeSlot`,
                      data: {
                        date: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: insight.publishTime || "",
                        },
                        endDate: {
                          field: "",
                          constantValueEnabled: false,
                          constantValue: "",
                        },
                      },
                      styles: {
                        includeTime: false,
                        includeRange: false,
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            date: insight.publishTime,
                          },
                    } satisfies WithId<TimestampProps>,
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
                            label: insight.cta?.label ?? "Read More",
                            link: insight.cta?.link ?? "#",
                            linkType: insight.cta?.linkType ?? "URL",
                            ctaType: "textAndLink",
                          },
                        },
                      },
                      styles: {
                        variant: props.styles.cards.ctaVariant,
                        presetImage: "app-store",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            cta: insight.cta,
                          },
                      eventName: `cta${i}`,
                    } satisfies WithId<CTAWrapperProps>,
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.field,
                    insight,
                  },
            } satisfies WithId<InsightCardProps>,
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
                    field: props.data.heading?.field ?? "",
                    constantValueEnabled:
                      props.data.heading?.constantValueEnabled ?? true,
                    constantValue: props.data.heading?.constantValue ?? "",
                  },
                },
                styles: props.styles.heading,
              } satisfies WithId<HeadingTextProps>,
            },
          ],
          CardsWrapperSlot: [
            {
              type: "InsightCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  field: props.data.insights.field,
                  constantValueEnabled:
                    props.data.insights.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies WithId<InsightCardsWrapperProps>,
            },
          ],
        },
      } satisfies WithId<InsightSectionProps>;
    },
  },
};
