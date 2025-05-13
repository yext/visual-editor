import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateTimeSelector } from "../components/DateTimeSelector.tsx";

export const INSIGHT_SECTION_CONSTANT_CONFIG: CustomField<InsightSectionType> =
  {
    type: "custom",
    render: ({
      onChange,
      value,
    }: {
      value: InsightSectionType;
      onChange: (value: InsightSectionType, uiState?: Partial<UiState>) => void;
    }) => {
      return (
        <div
          className={
            "ve-mt-4" + (value.insights.length === 0 ? " empty-array-fix" : "")
          }
        >
          <AutoField
            field={InsightStructArrayField}
            value={value.insights}
            onChange={(newValue, uiState) =>
              onChange({ insights: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const InsightStructArrayField: ArrayField<InsightStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    image: {
      type: "object",
      label: "Image",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    },
    name: {
      type: "text",
      label: "Name",
    },
    category: {
      type: "text",
      label: "Category",
    },
    publishTime: DateTimeSelector,
    description: {
      type: "textarea",
      label: "Description",
    },
    cta: ctaFields,
  },
  getItemSummary: (item, i) => item.name ?? "Insight " + ((i ?? 0) + 1),
};
