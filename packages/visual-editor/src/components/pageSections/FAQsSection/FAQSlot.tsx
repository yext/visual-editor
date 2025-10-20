import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@measured/puck";
import { BodyTextProps, FAQStruct, msg } from "@yext/visual-editor";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion";
import { useAnalytics } from "@yext/pages-components";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";

export const defaultFAQSlotData = (id?: string, index?: number) => ({
  type: "FAQSlot",
  props: {
    ...(id && { id }),
    ...(index !== undefined && { index }),
    slots: {
      QuestionSlot: [
        {
          type: "BodyTextSlot",
          props: {
            ...(id && { id: `${id}-question` }),
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF("Question Lorem ipsum dolor sit amet?"),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
          } satisfies BodyTextProps,
        },
      ],
      AnswerSlot: [
        {
          type: "BodyTextSlot",
          props: {
            ...(id && { id: `${id}-answer` }),
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                  ),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
          } satisfies BodyTextProps,
        },
      ],
    },
  },
});

export type FAQSlotProps = {
  slots: {
    QuestionSlot: Slot;
    AnswerSlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    faq: FAQStruct;
  };

  /** @internal */
  index?: number;
};

const FaqSlotFields: Fields<FAQSlotProps> = {
  slots: {
    type: "object",
    objectFields: {
      QuestionSlot: { type: "slot", allow: [] },
      AnswerSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const FaqSlotComponent: PuckComponent<FAQSlotProps> = ({ slots, index }) => {
  const analytics = useAnalytics();

  return (
    <AccordionItem
      key={index}
      data-ya-action={
        analytics?.getDebugEnabled() ? "EXPAND/COLLAPSE" : undefined
      }
      data-ya-eventname={
        analytics?.getDebugEnabled() ? `toggleFAQ${index}` : undefined
      }
      onToggle={(e) =>
        e.currentTarget.open // the updated state after toggling
          ? analytics?.track({
              action: "EXPAND",
              eventName: `toggleFAQ${index}`,
            })
          : analytics?.track({
              action: "COLLAPSE",
              eventName: `toggleFAQ${index}`,
            })
      }
    >
      <AccordionTrigger>
        <slots.QuestionSlot />
      </AccordionTrigger>
      <AccordionContent>
        <slots.AnswerSlot />
      </AccordionContent>
    </AccordionItem>
  );
};

export const FAQSlot: ComponentConfig<{ props: FAQSlotProps }> = {
  label: msg("slots.FAQ", "FAQ"),
  fields: FaqSlotFields,
  defaultProps: {
    slots: {
      QuestionSlot: [],
      AnswerSlot: [],
    },
  },
  resolveData: (data) => {
    if (data.props.parentData) {
      const faq = data.props.parentData.faq;
      const field = data.props.parentData.field;

      data = setDeep(data, "props.slots.QuestionSlot[0].props.parentData", {
        field: field,
        richText: faq.question,
      } satisfies BodyTextProps["parentData"]);

      data = setDeep(data, "props.slots.AnswerSlot[0].props.parentData", {
        field: field,
        richText: faq.answer,
      } satisfies BodyTextProps["parentData"]);

      return data;
    } else {
      data = setDeep(
        data,
        "props.slots.QuestionSlot[0].props.parentData",
        undefined
      );

      data = setDeep(
        data,
        "props.slots.AnswerSlot[0].props.parentData",
        undefined
      );
      return data;
    }
  },
  render: (props) => <FaqSlotComponent {...props} />,
};
