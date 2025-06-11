import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";
import { pt } from "../../../utils/i18nPlatform.ts";

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
  return {
    label: pt("arrayField", "Array Field"),
    type: "array",
    arrayFields: {
      image: {
        type: "object",
        label: pt("image", "Image"),
        objectFields: {
          url: {
            label: pt("url", "URL"),
            type: "text",
          },
        },
      },
      name: {
        type: "text",
        label: pt("name", "Name"),
      },
      category: {
        type: "text",
        label: pt("Category", "Category"),
      },
      description: {
        type: "textarea",
        label: pt("description", "Description"),
      },
      cta: ctaFields(),
    },
    getItemSummary: (item, i) =>
      item.name ? item.name : pt("product", "Product") + " " + ((i ?? 0) + 1),
  };
};
