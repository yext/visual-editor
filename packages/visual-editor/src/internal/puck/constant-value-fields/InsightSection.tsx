import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateSelector } from "../components/DateSelector.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";

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
        <div className={"ve-mt-4"}>
          <AutoField
            field={InsightStructArrayField()}
            value={value.insights}
            onChange={(newValue, uiState) =>
              onChange({ insights: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const InsightStructArrayField = (): ArrayField<InsightStruct[]> => {
  return {
    label: pt("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: pt("image", "Image"),
        objectFields: {
          url: {
            label: pt("url", "URL"),
            type: "text",
          },
        },
      },
      name: {
        type: "text",
        label: pt("name", "Name"),
      },
      category: {
        type: "text",
        label: pt("category", "Category"),
      },
      publishTime: DateSelector,
      description: {
        type: "textarea",
        label: pt("descriptions", "Description"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.name ? item.name : pt("insight", "Insight") + " " + ((i ?? 0) + 1),
  };
};
