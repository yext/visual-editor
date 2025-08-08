import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  ProductSectionType,
  ProductStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { RESTRICTED_CTA_CONSTANT_CONFIG } from "./EnhancedCallToAction.tsx";
import { msg, usePlatformTranslation } from "../../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useMemo } from "react";
import { useDocument } from "../../../hooks/useDocument.tsx";

export const defaultProduct: ProductStruct = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  name: { en: "Product Title", hasLocalizedValue: "true" },
  category: {
    en: "Category, Pricing, etc",
    hasLocalizedValue: "true",
  },
  description: {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    hasLocalizedValue: "true",
  },
  cta: {
    link: "#",
    label: { en: "Learn More", hasLocalizedValue: "true" },
    linkType: "URL",
    ctaType: "textAndLink",
  },
};

export const PRODUCT_SECTION_CONSTANT_CONFIG: CustomField<ProductSectionType> =
  {
    type: "custom",
    render: ({
      onChange,
      value,
    }: {
      value: ProductSectionType;
      onChange: (value: ProductSectionType, uiState?: Partial<UiState>) => void;
    }) => {
      return (
        <div className={"ve-mt-4"}>
          <AutoField
            field={ProductStructArrayField()}
            value={value.products}
            onChange={(newValue, uiState) =>
              onChange({ products: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const ProductStructArrayField = (): ArrayField<ProductStruct[]> => {
  const { t, i18n } = usePlatformTranslation();
  const streamDocument = useDocument();

  const nameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("fields.name", "Name"),
      { types: ["type.string"] }
    );
  }, []);

  const categoryField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      msg("fields.category", "Category"),
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
      description: descriptionField,
      cta: RESTRICTED_CTA_CONSTANT_CONFIG,
    },
    defaultItemProps: defaultProduct,
    getItemSummary: (item, i) => {
      const translation =
        item?.name &&
        resolveComponentData(item.name, i18n.language, streamDocument);
      if (translation) {
        return translation;
      }
      return t("product", "Product") + " " + ((i ?? 0) + 1);
    },
  };
};
