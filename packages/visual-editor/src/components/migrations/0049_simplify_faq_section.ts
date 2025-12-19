import {
  FAQSectionType,
  resolveYextEntityField,
  YextEntityField,
} from "@yext/visual-editor";
import { Migration } from "../../utils/migrate";

export const simplifyFaqSection: Migration = {
  FAQSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const faqWrapper = props.slots.FAQsWrapperSlot[0];

      const faqs = resolveYextEntityField(
        streamDocument,
        faqWrapper.props.data as YextEntityField<FAQSectionType>,
        streamDocument?.locale || "en"
      )?.faqs;

      const cards = faqWrapper.props.slots?.CardSlot?.map(
        (faqSlotProps: any, index: number) => {
          const questionSlot = faqSlotProps.props.slots.QuestionSlot[0];
          const answerSlot = faqSlotProps.props.slots.AnswerSlot[0];

          return {
            type: "FAQCard",
            props: {
              id: faqSlotProps.props.id,
              index: index,
              data: {
                question: {
                  constantValue: questionSlot?.props.data.text.constantValue,
                  field: questionSlot.props.data.text.field,
                  constantValueEnabled: faqWrapper.props.data
                    .constantValueEnabled
                    ? questionSlot.props.data.text.constantValueEnabled
                    : false,
                },
                answer: {
                  constantValue: answerSlot?.props.data.text.constantValue,
                  field: answerSlot.props.data.text.field,
                  constantValueEnabled: faqWrapper.props.data
                    .constantValueEnabled
                    ? answerSlot.props.data.text.constantValueEnabled
                    : false,
                },
              },
              styles: {
                questionVariant: questionSlot?.props.styles.variant,
                answerVariant: answerSlot?.props.styles.variant,
              },
              parentData: {
                field: faqWrapper.props.data.field,
                faq: {
                  question: faqs?.[index]?.question,
                  answer: faqs?.[index]?.answer,
                },
              },
              slots: {},
            },
          };
        }
      );

      return {
        id: props.id,
        analytics: props.analytics,
        liveVisibility: props.liveVisibility,
        styles: props.styles,
        data: faqWrapper.props.data,
        slots: {
          HeadingSlot: props.slots.HeadingSlot,
          CardSlot: cards,
        },
      };
    },
  },
};
