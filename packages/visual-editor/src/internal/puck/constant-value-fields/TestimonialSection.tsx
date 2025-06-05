import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { DateSelector } from "../components/DateSelector.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { TFunction } from "i18next";

export const TESTIMONIAL_SECTION_CONSTANT_CONFIG: CustomField<TestimonialSectionType> =
  {
    type: "custom",
    render: ({
      onChange,
      value,
    }: {
      value: TestimonialSectionType;
      onChange: (
        value: TestimonialSectionType,
        uiState?: Partial<UiState>
      ) => void;
    }) => {
      const { t } = usePlatformTranslation();

      return (
        <div className={"ve-mt-4"}>
          <AutoField
            field={TestimonialStructArrayField(t)}
            value={value.testimonials}
            onChange={(newValue, uiState) =>
              onChange({ testimonials: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const TestimonialStructArrayField = (
  t: TFunction
): ArrayField<TestimonialStruct[]> => ({
  label: t("arrayField", "Array Field"),
  type: "array",
  arrayFields: {
    description: {
      type: "textarea",
      label: t("description", "Description"),
    },
    contributorName: {
      type: "text",
      label: t("contributorName", "Contributor Name"),
    },
    contributionDate: DateSelector,
  },
  getItemSummary: (item, i) =>
    item.contributorName
      ? item.contributorName
      : t("testimonial", "Testimonial") + " " + ((i ?? 0) + 1),
});
