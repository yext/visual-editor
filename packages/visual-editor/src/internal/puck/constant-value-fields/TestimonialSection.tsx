import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { DateSelector } from "../components/DateSelector.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";

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
      return (
        <div className={"ve-mt-4"}>
          <AutoField
            field={TestimonialStructArrayField()}
            value={value.testimonials}
            onChange={(newValue, uiState) =>
              onChange({ testimonials: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const TestimonialStructArrayField = (): ArrayField<TestimonialStruct[]> => ({
  label: pt("arrayField", "Array Field"),
  type: "array",
  arrayFields: {
    description: {
      type: "textarea",
      label: pt("description", "Description"),
    },
    contributorName: {
      type: "text",
      label: pt("contributorName", "Contributor Name"),
    },
    contributionDate: DateSelector,
  },
  getItemSummary: (item, i) =>
    item.contributorName
      ? item.contributorName
      : pt("testimonial", "Testimonial") + " " + ((i ?? 0) + 1),
});
