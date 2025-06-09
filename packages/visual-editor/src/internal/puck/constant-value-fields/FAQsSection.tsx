import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { FAQSectionType, FAQStruct } from "../../../types/types.ts";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

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
  const { t } = usePlatformTranslation();

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      question: {
        type: "text",
        label: t("question", "Question"),
      },
      answer: {
        type: "textarea",
        label: t("answer", "Answer"),
      },
    },
    getItemSummary: (item, i) =>
      item.question ? item.question : t("FAQ", "FAQ") + " " + ((i ?? 0) + 1),
  };
};
