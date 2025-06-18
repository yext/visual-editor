import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  ProductSectionType,
  ProductStruct,
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";
import { translatableCTAFields } from "./CallToAction.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import { useMemo } from "react";

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

  const nameField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      {
        key: "name",
        options: {
          defaultValue: "Name",
        },
      },
      "text"
    );
  }, []);

  const categoryField = useMemo(() => {
    return TranslatableStringField<TranslatableString | undefined>(
      {
        key: "category",
        options: {
          defaultValue: "Category",
        },
      },
      "text"
    );
  }, []);

  const descriptionField = useMemo(() => {
    return TranslatableRichTextField<TranslatableRichText | undefined>({
      key: "description",
      options: {
        defaultValue: "Description",
      },
    });
  }, []);

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
      name: nameField,
      category: categoryField,
      description: descriptionField,
      cta: translatableCTAFields(),
    },
    defaultItemProps: defaultProduct,
    getItemSummary: (item, i) => {
      const translation = resolveTranslatableString(item.name, i18n.language);
      if (translation) {
        return translation;
      }
      return t("product", "Product") + " " + ((i ?? 0) + 1);
    },
  };
};
