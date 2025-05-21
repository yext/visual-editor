import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { FAQSectionType, FAQStruct } from "../../../types/types.ts";

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
          field={FAQStructArrayField}
          value={value.faqs}
          onChange={(newValue, uiState) =>
            onChange({ faqs: newValue }, uiState)
          }
        />
      </div>
    );
  },
};

const FAQStructArrayField: ArrayField<FAQStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    question: {
      type: "text",
      label: "Question",
    },
    answer: {
      type: "textarea",
      label: "Answer",
    },
  },
  getItemSummary: (item, i) => item.question ?? "FAQ " + ((i ?? 0) + 1),
};
