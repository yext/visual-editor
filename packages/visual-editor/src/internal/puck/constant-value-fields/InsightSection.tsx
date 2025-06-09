import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { DateSelector } from "../components/DateSelector.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

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
  const { t } = usePlatformTranslation();

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: t("image", "Image"),
        objectFields: {
          url: {
            label: t("url", "URL"),
            type: "text",
          },
        },
      },
      name: {
        type: "text",
        label: t("name", "Name"),
      },
      category: {
        type: "text",
        label: t("category", "Category"),
      },
      publishTime: DateSelector,
      description: {
        type: "textarea",
        label: t("descriptions", "Description"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.name ? item.name : t("insight", "Insight") + " " + ((i ?? 0) + 1),
  };
};
