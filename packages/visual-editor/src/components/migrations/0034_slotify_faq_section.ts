import { Migration } from "../../utils/migrate.ts";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { WithId } from "@measured/puck";
import { BodyTextProps } from "../index.ts";
import { FAQSectionType } from "../../types/types.ts";
import { FAQSlotProps } from "../pageSections/FAQsSection/FAQSlot.tsx";
import { FAQsWrapperSlotProps } from "../pageSections/FAQsSection/FAQsWrapperSlot.tsx";

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

      const constantValueEnabled: boolean = props.data.constantValueEnabled;
      const faqs = resolveYextEntityField(
        streamDocument,
        props.data.faqs as YextEntityField<FAQSectionType>,
        streamDocument?.locale
      )?.faqs;

      const cards =
        faqs?.map((faq, i) => {
          return {
            type: "FAQSlot",
            props: {
              id: `${props.id}-Card-${i}`,
              slots: {
                QuestionSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
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
                    } satisfies BodyTextProps,
                  },
                ],
                AnswerSlot: [
                  {
                    type: "BodyTextSlot",
                    props: {
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
                    } satisfies BodyTextProps,
                  },
                ],
              },
              parentData: constantValueEnabled
                ? undefined
                : {
                    field: props.data.field,
                    faq,
                  },
            } satisfies WithId<FAQSlotProps>,
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
              } satisfies FAQsWrapperSlotProps,
            },
          ],
        },
      };
    },
  },
};
