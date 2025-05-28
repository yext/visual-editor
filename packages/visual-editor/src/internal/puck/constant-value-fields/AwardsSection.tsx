import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { AwardSectionType, AwardStruct } from "../../../types/types.ts";

export const AWARDS_SECTION_CONSTANT_CONFIG: CustomField<AwardSectionType> = {
  type: "custom",
  render: ({
    onChange,
    value,
  }: {
    value: AwardSectionType;
    onChange: (value: AwardSectionType, uiState?: Partial<UiState>) => void;
  }) => {
    return (
      <div
        className={
          "ve-mt-4" + (value.awards.length === 0 ? " empty-array-fix" : "")
        }
      >
        <AutoField
          field={AwardsStructArrayField}
          value={value.awards}
          onChange={(newValue, uiState) =>
            onChange({ awards: newValue }, uiState)
          }
        />
      </div>
    );
  },
};
const AwardsStructArrayField: ArrayField<AwardStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    image: {
      type: "object",
      label: "Award Image",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    },
    title: {
      type: "text",
      label: "Award Title",
    },
    description: {
      type: "textarea",
      label: "Award Description",
    },
  },
  getItemSummary: (item, i) => item.title ?? "Award " + ((i ?? 0) + 1),
};
