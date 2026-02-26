// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { YetiParagraph } from "../atoms/YetiParagraph.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiFaqListSlotProps {
  data: {
    items: Array<{
      question: TranslatableString;
      answer: TranslatableString;
    }>;
  };
}

const defaultFaqItem = {
  question: toTranslatableString("Question"),
  answer: toTranslatableString("Answer"),
};

const fields: Fields<YetiFaqListSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      items: YextField("Items", {
        type: "array",
        defaultItemProps: defaultFaqItem,
        arrayFields: {
          question: YextField("Question", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          answer: YextField("Answer", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
        },
      }),
    },
  }),
};

const YetiFaqListSlotComponent: PuckComponent<YetiFaqListSlotProps> = ({
  data,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-3">
      {data.items.map((item, index) => {
        const question = resolveComponentData(
          item?.question,
          i18n.language,
          streamDocument
        );
        const answer = resolveComponentData(
          item?.answer,
          i18n.language,
          streamDocument
        );

        if (!question && !answer) {
          return null;
        }

        return (
          <details
            key={`faq-item-${index}`}
            className="border-b border-black/10 pb-3"
          >
            <summary className="cursor-pointer list-none text-base font-semibold">
              {question}
            </summary>
            {answer ? (
              <YetiParagraph className="mt-2 text-sm leading-relaxed">
                {answer}
              </YetiParagraph>
            ) : null}
          </details>
        );
      })}
    </div>
  );
};

export const defaultYetiFaqListSlotProps: YetiFaqListSlotProps = {
  data: {
    items: [
      {
        question: toTranslatableString("Are pets allowed in this store?"),
        answer: toTranslatableString(
          "Furry friends are welcome in our patio area, with fresh water available."
        ),
      },
      {
        question: toTranslatableString("Where can I park?"),
        answer: toTranslatableString(
          "Parking is available in nearby garages and around surrounding streets."
        ),
      },
      {
        question: toTranslatableString(
          "Do you have drinkware with city-specific designs?"
        ),
        answer: toTranslatableString(
          "Each store location offers drinkware artwork inspired by its city."
        ),
      },
      {
        question: toTranslatableString("Is there curbside pickup?"),
        answer: toTranslatableString(
          "Yes. Shop online and associates can help load your order at pickup."
        ),
      },
      {
        question: toTranslatableString(
          "Can I host a private event at this store?"
        ),
        answer: toTranslatableString(
          "Contact the local store team for details on private event options."
        ),
      },
    ],
  },
};

export const YetiFaqListSlot: ComponentConfig<{ props: YetiFaqListSlotProps }> =
  {
    label: "Yeti FAQ List Slot",
    fields,
    defaultProps: defaultYetiFaqListSlotProps,
    render: (props) => <YetiFaqListSlotComponent {...props} />,
  };
