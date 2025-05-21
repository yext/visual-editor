import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { DateSelector } from "../components/DateSelector.tsx";

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
            field={TestimonialStructArrayField}
            value={value.testimonials}
            onChange={(newValue, uiState) =>
              onChange({ testimonials: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const TestimonialStructArrayField: ArrayField<TestimonialStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    description: {
      type: "textarea",
      label: "Description",
    },
    contributorName: {
      type: "text",
      label: "Contributor Name",
    },
    contributionDate: DateSelector,
  },
  getItemSummary: (item, i) =>
    item.contributorName ?? "Testimonial " + ((i ?? 0) + 1),
};
