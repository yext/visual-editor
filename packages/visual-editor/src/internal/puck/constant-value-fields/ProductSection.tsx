import { ArrayField, CustomField, AutoField, UiState } from "@measured/puck";
import { ProductSectionType, ProductStruct } from "../../../types/types.ts";
import { ctaFields } from "./CallToAction.tsx";

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
        <div
          className={
            "ve-mt-4" + (value.products.length === 0 ? " empty-array-fix" : "")
          }
        >
          <AutoField
            field={ProductStructArrayField}
            value={value.products}
            onChange={(newValue, uiState) =>
              onChange({ products: newValue }, uiState)
            }
          />
        </div>
      );
    },
  };

const ProductStructArrayField: ArrayField<ProductStruct[]> = {
  label: "Array Field",
  type: "array",
  arrayFields: {
    image: {
      type: "object",
      label: "Image",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    },
    name: {
      type: "text",
      label: "Name",
    },
    category: {
      type: "text",
      label: "Category",
    },
    description: {
      type: "textarea",
      label: "Description",
    },
    cta: ctaFields,
  },
  getItemSummary: (item, i) => item.name ?? "Product " + ((i ?? 0) + 1),
};
