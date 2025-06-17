import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  TestimonialSectionType,
  TestimonialStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { DateSelector } from "../components/DateSelector.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
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
      msg("contributorName", "Contributor Name"),
      "text"
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRichText | undefined>(
      msg("descriptions", "Description")
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
