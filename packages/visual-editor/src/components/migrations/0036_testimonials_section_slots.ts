import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { TestimonialSectionProps } from "../pageSections/TestimonialSection/TestimonialSection";
import { TestimonialCardProps } from "../pageSections/TestimonialSection/TestimonialCard";
import { TestimonialCardsWrapperProps } from "../pageSections/TestimonialSection/TestimonialCardsWrapper";
import { HeadingTextProps } from "../contentBlocks/HeadingText";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";
import { TestimonialSectionType } from "../../types/types";
import { YextEntityField } from "../../editor/YextEntityFieldSelector";
import { BodyTextProps } from "../contentBlocks/BodyText";
import { resolveComponentData } from "../../utils/resolveComponentData";

export const testimonialsSectionSlots: Migration = {
  TestimonialSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const constantValueEnabled: boolean =
        props.data.testimonials.constantValueEnabled;
      const testimonials = resolveYextEntityField(
        streamDocument,
        props.data.testimonials as YextEntityField<TestimonialSectionType>,
        streamDocument.locale || "en"
      )?.testimonials;

      const cards =
        testimonials?.map((testimonial, i) => {
          const resolvedContributorName = testimonial.contributorName
            ? resolveComponentData(
                testimonial.contributorName,
                streamDocument.locale || "en",
                streamDocument
              )
            : "";
          const cardId = `${props.id}-Card-${i}`;
          return {
            type: "TestimonialCard",
            props: {
              id: cardId,
              styles: {
                backgroundColor: props.styles.cards.backgroundColor,
              },
              slots: {
                DescriptionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-DescriptionSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: testimonial.description ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.testimonials.field,
                            richText: testimonial.description,
                          },
                    } satisfies WithId<BodyTextProps>,
                  },
                ],
                ContributorNameSlot: [
                  {
                    type: "HeadingTextSlot",
                    props: {
                      id: `${cardId}-ContributorNameSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: testimonial.contributorName ?? "",
                        },
                      },
                      styles: {
                        level: props.styles.cards.headingLevel,
                        align: "left",
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.testimonials.field,
                            text: resolvedContributorName,
                          },
                    } satisfies WithId<HeadingTextProps>,
                  },
                ],
                ContributionDateSlot: [
                  {
                    type: "Timestamp",
                    props: {
                      id: `${cardId}-ContributionDateSlot`,
                      data: {
                        date: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: testimonial.contributionDate ?? "",
                        },
                      },
                      styles: {
                        option: "DATE",
                        hideTimeZone: true,
                      },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.testimonials.field,
                            date: testimonial.contributionDate,
                          },
                    },
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.testimonials.field,
                    testimonial,
                  },
            } satisfies WithId<TestimonialCardProps>,
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
                id: `${props.id}-SectionHeadingSlot`,
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
              type: "TestimonialCardsWrapper",
              props: {
                id: `${props.id}-CardsWrapperSlot`,
                data: {
                  field: props.data.testimonials.field,
                  constantValueEnabled:
                    props.data.testimonials.constantValueEnabled,
                  constantValue: constantValueEnabled
                    ? cards.map((c) => ({ id: c.props.id }))
                    : [],
                },
                slots: {
                  CardSlot: cards,
                },
              } satisfies WithId<TestimonialCardsWrapperProps>,
            },
          ],
        },
      } satisfies WithId<TestimonialSectionProps>;
    },
  },
};
