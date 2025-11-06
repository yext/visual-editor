import { Migration } from "../../utils/migrate.ts";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { FAQSectionType } from "../../types/types.ts";

export const faqsSectionSlots: Migration = {
  FAQSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const headingText = props.data.heading ?? {
        constantValue: {
          en: "Frequently Asked Questions",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
        field: "",
      };
      const headingStyles = {
        level: props.styles?.heading?.level ?? 2,
        align: props.styles?.heading?.align ?? "left",
      };

      const constantValueEnabled: boolean =
        props.data.faqs.constantValueEnabled;
      const faqs = resolveYextEntityField(
        streamDocument,
        props.data.faqs as YextEntityField<FAQSectionType>,
        streamDocument?.locale || "en"
      )?.faqs;

      const cards =
        faqs?.map((faq, i) => {
          const cardId = `${props.id}-Card-${i}`;
          return {
            type: "FAQSlot",
            props: {
              id: cardId,
              slots: {
                QuestionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-QuestionSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValue: faq.question ?? "",
                          constantValueEnabled: true,
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: faq.question,
                          },
                    },
                  },
                ],
                AnswerSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
                      id: `${cardId}-AnswerSlot`,
                      data: {
                        text: {
                          field: "",
                          constantValueEnabled: true,
                          constantValue: faq.answer ?? "",
                        },
                      },
                      styles: { variant: "base" },
                      parentData: constantValueEnabled
                        ? undefined
                        : {
                            field: props.data.field,
                            richText: faq.answer,
                          },
                    },
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.field,
                    faq,
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
          HeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-HeadingSlot`,
                data: {
                  text: headingText,
                },
                styles: headingStyles,
              },
            },
          ],
          FAQsWrapperSlot: [
            {
              type: "FAQsWrapperSlot",
              props: {
                id: `${props.id}-FAQsWrapperSlot`,
                data: {
                  field: props.data.faqs.field,
                  constantValueEnabled: props.data.faqs.constantValueEnabled,
                  constantValue: cards.map((c) => ({
                    id: c.props.id,
                  })),
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
