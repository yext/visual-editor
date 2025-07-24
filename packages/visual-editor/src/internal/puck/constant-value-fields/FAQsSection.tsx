import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { FAQSectionType, FAQStruct } from "../../../types/types.ts";
import {
  msg,
  pt,
  usePlatformTranslation,
} from "../../../utils/i18n/platform.ts";
import { useMemo } from "react";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";

export const defaultFAQ: FAQStruct = {
  question: {
    en: "Question Lorem ipsum dolor sit amet?",
    hasLocalizedValue: "true",
  },
  answer: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    hasLocalizedValue: "true",
  },
};

export const FAQ_SECTION_CONSTANT_CONFIG: CustomField<FAQSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: FAQSectionType;
    onChange: (value: FAQSectionType, uiState?: Partial<UiState>) => void;
  }) => {
    return (
      <div className={"ve-mt-4"}>
        <AutoField
          field={FAQStructArrayField()}
          value={value.faqs}
          onChange={(newValue, uiState) =>
            onChange({ faqs: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const FAQStructArrayField = (): ArrayField<FAQStruct[]> => {
  const { t, i18n } = usePlatformTranslation();
  const streamDocument = useDocument();

  const questionField = useMemo(() => {
    return TranslatableStringField(msg("fields.question", "Question"), {
      types: ["type.string"],
    });
  }, []);

  const answerField = useMemo(() => {
    return TranslatableRichTextField(msg("fields.answer", "Answer"));
  }, []);

  return {
    label: pt("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      question: questionField,
      answer: answerField,
    },
    defaultItemProps: defaultFAQ,
    getItemSummary: (item, i): string => {
      const translation = resolveTranslatableString(
        item.question,
        i18n.language,
        streamDocument
      );
      if (translation) {
        return translation;
      }
      return t("faq", "FAQ") + " " + ((i ?? 0) + 1);
    },
  };
};
