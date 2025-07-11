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

export const defaultTestimonial: TestimonialStruct = {
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    hasLocalizedValue: "true",
  },
  contributorName: { en: "Name", hasLocalizedValue: "true" },
  contributionDate: "July 22, 2022",
};

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
      msg("fields.contributorName", "Contributor Name"),
      { types: ["type.string"] }
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRichText | undefined>(
      msg("fields.description", "Description")
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
    defaultItemProps: defaultTestimonial,
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
