import { ArrayField } from "@measured/puck";
import { pt } from "../../../utils/i18n/platform.ts";
import { type ProductStruct } from "../../../types/types.ts";

export const PRODUCT_SECTION_CONSTANT_CONFIG: ArrayField<any> = {
  type: "array",
  arrayFields: {
    id: {
      type: "text",
      visible: false,
    },
  },
  label: "",
  getItemSummary: (item: ProductStruct, index?: number) =>
    pt("product", "Product") + " " + ((index ?? 0) + 1),
};
