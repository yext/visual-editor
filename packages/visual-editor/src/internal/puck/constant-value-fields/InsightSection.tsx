import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  InsightSectionType,
  InsightStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { translatableCTAFields } from "./CallToAction.tsx";
import { DateSelector } from "../components/DateSelector.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";

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
  const { t, i18n } = usePlatformTranslation();

  const nameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("name", "Name"),
      "text"
    );
  }, []);

  const categoryField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("category", "Category"),
      "text"
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
      image: {
        type: "object",
        label: t("fields.image", "Image"),
        objectFields: {
          url: {
            label: t("fields.url", "URL"),
            type: "text",
          },
        },
      },
      name: nameField,
      category: categoryField,
      publishTime: DateSelector,
      description: descriptionField,
      cta: translatableCTAFields(),
    },
    getItemSummary: (item, i) => {
      const translation = resolveTranslatableString(item.name, i18n.language);
      if (translation) {
        return translation;
      }
      return t("insight", "Insight") + " " + ((i ?? 0) + 1);
    },
  };
};
