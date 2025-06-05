import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

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
  const { t } = usePlatformTranslation();

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
      name: {
        type: "text",
        label: t("name", "Name"),
      },
      category: {
        type: "text",
        label: t("Category", "Category"),
      },
      description: {
        type: "textarea",
        label: t("description", "Description"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.name ? item.name : t("product", "Product") + " " + ((i ?? 0) + 1),
  };
};
