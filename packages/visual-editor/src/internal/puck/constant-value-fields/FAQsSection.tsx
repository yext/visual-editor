import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { FAQSectionType, FAQStruct } from "../../../types/types.ts";
import {
  msg,
  pt,
  usePlatformTranslation,
} from "../../../utils/i18nPlatform.ts";
import { useMemo } from "react";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";

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

  const questionField = useMemo(() => {
    return TranslatableStringField(msg("fields.question", "Question"), "text");
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
    getItemSummary: (item, i): string => {
      const translation = resolveTranslatableString(
        item.question,
        i18n.language
      );
      if (translation) {
        return translation;
      }
      return t("faq", "FAQ") + " " + ((i ?? 0) + 1);
    },
  };
};
