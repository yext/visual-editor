import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import {
  ProductSectionType,
  ProductStruct,
  TranslatableRTF2,
  TranslatableString,
} from "../../../types/types.ts";
import { translatableCTAFields } from "./CallToAction.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";
import { translatableStringConfig } from "../../../puck/config/translatableStringConfig.tsx";
import { resolveTranslatableString } from "../../../utils/resolveTranslatableString.tsx";
import { useMemo } from "react";
import { translatableRTF2Config } from "@yext/visual-editor";

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
    return translatableStringConfig<TranslatableString | undefined>(
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
    return translatableStringConfig<TranslatableString | undefined>(
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
    return translatableRTF2Config<TranslatableRTF2 | undefined>(
      {
        key: "description",
        options: {
          defaultValue: "Description",
        },
      },
      "textarea"
    );
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
    getItemSummary: (item, i) => {
      const translation = resolveTranslatableString(item.name, i18n.language);
      if (translation) {
        return translation;
      }
      return t("product", "Product") + " " + ((i ?? 0) + 1);
    },
  };
};
