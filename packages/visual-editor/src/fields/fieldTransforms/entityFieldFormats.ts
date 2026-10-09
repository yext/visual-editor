import type { EntityFieldSelectorField } from "../EntityFieldSelectorField.tsx";
import { formatCurrency } from "../../utils/productPrice.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Maps explicit entity-field formats to their render-value conversion. */
export const entityFieldFormatters: Record<
  NonNullable<EntityFieldSelectorField["format"]>,
  (value: any, context: FieldTransformContext) => unknown
> = {
  price: (value, context) =>
    formatCurrency(value?.value, value?.currencyCode, context.locale),
};
