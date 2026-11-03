import type { EntityFieldSelectorField } from "../EntityFieldSelectorField.tsx";
import type { ProductPrice } from "../../types/types.ts";
import { formatCurrency } from "../../utils/productPrice.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Maps explicit entity-field formats to their render-value conversion. */
export const entityFieldFormatters = {
  price: (
    value: ProductPrice | undefined,
    context: FieldTransformContext
  ): string | undefined =>
    formatCurrency(value?.value, value?.currencyCode, context.locale),
} satisfies Record<
  NonNullable<EntityFieldSelectorField["format"]>,
  (value: any, context: FieldTransformContext) => unknown
>;
