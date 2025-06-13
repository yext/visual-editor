import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TestimonialSectionType,
  TestimonialStruct,
  TranslatableRTF2,
  TranslatableString,
} from "../../../types/types.ts";
import { DateSelector } from "../components/DateSelector.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import { useMemo } from "react";

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

const TestimonialStructArrayField = (): ArrayField<TestimonialStruct[]> => {
  const { t, i18n } = usePlatformTranslation();

  const contributorNameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      {
        key: "contributorName",
        options: {
          defaultValue: "Contributor Name",
        },
      },
      "text"
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRTF2 | undefined>(
      {
        key: "description",
        options: {
          defaultValue: "Description",
        },
      },
      "text"
    );
  }, []);

  return {
    label: t("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      description: descriptionField,
      contributorName: contributorNameField,
      contributionDate: DateSelector,
    },
    getItemSummary: (item, i) => {
      const translation = resolveTranslatableString(
        item.contributorName,
        i18n.language
      );
      if (translation) {
        return translation;
      }
      return t("testimonial", "Testimonial") + " " + ((i ?? 0) + 1);
    },
  };
};
