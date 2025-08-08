import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  InsightSectionType,
  InsightStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { RESTRICTED_CTA_CONSTANT_CONFIG } from "./EnhancedCallToAction.tsx";
import { DateSelector } from "../components/DateSelector.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18n/platform.ts";
import { useMemo } from "react";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";

export const defaultInsight: InsightStruct = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  name: { en: "Article Name", hasLocalizedValue: "true" },
  category: { en: "Category", hasLocalizedValue: "true" },
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters",
    hasLocalizedValue: "true",
  },
  publishTime: "2022-08-02",
  cta: {
    link: "#",
    label: { en: "Read More", hasLocalizedValue: "true" },
    linkType: "URL",
    ctaType: "textAndLink",
  },
};

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
  const streamDocument = useDocument();

  const nameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("name", "Name"),
      { types: ["type.string"] }
    );
  }, []);

  const categoryField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("category", "Category"),
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
      cta: RESTRICTED_CTA_CONSTANT_CONFIG,
    },
    defaultItemProps: defaultInsight,
    getItemSummary: (item, i) => {
      const translation =
        item.name &&
        resolveComponentData(item.name, i18n.language, streamDocument);
      if (translation) {
        return translation;
      }
      return t("insight", "Insight") + " " + ((i ?? 0) + 1);
    },
  };
};
