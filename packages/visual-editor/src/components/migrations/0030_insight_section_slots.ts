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
import { getDefaultRTF } from "../../editor/TranslatableRichTextField";

export const insightSectionSlots: Migration = {
  InsightSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean = props.data.constantValueEnabled;
      const insights = resolveYextEntityField(
        streamDocument,
        props.data.insights as YextEntityField<InsightSectionType>,
        streamDocument.meta?.locale
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
          return {
            type: "InsightCard",
            props: {
              id: "InsightCard-migrated-" + i,
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
                          constantValue: insight.image || {
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
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            image: insight.image,
                          },
                    } satisfies ImageWrapperProps,
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
                    } satisfies HeadingTextProps,
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
                    } satisfies BodyTextProps,
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
                    } satisfies BodyTextProps,
                  },
                ],
                PublishTimeSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: insight.publishTime
                            ? getDefaultRTF(insight.publishTime)
                            : getDefaultRTF(""),
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: insight.publishTime
                              ? getDefaultRTF(insight.publishTime)
                              : undefined,
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
                            label: insight.cta?.label ?? "Read More",
                            link: insight.cta?.link ?? "#",
                            linkType: insight.cta?.linkType ?? "URL",
                            ctaType: "textAndLink",
                          },
                        },
                      },
                      styles: { variant: props.styles.cards.ctaVariant },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            cta: insight.cta,
                          },
                    } satisfies CTAWrapperProps,
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
              type: "InsightCardsWrapper",
              props: {
                data: {
                  field: props.data.insights.field,
                  constantValueEnabled:
                    props.data.insights.constantValueEnabled,
                  constantValue: cards.map((c) => ({ id: c.props.id })),
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies InsightCardsWrapperProps,
            },
          ],
        },
      } satisfies WithId<InsightSectionProps>;
    },
  },
};
