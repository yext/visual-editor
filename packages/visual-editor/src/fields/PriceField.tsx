import React from "react";
import type { FieldProps } from "@puckeditor/core";
import {
  EntityFieldSelectorFieldOverride,
  type EntityFieldSelectorField,
} from "./EntityFieldSelectorField.tsx";

export type PriceField = Omit<
  EntityFieldSelectorField,
  "type" | "filter" | "constantValueFilter" | "repeated"
> & { type: "price" };

/** Author a structured price with the existing mapped/static entity selector. */
export const PriceFieldOverride = ({
  field,
  ...props
}: FieldProps<PriceField>): React.ReactElement => (
  <EntityFieldSelectorFieldOverride
    {...props}
    field={{ ...field, type: "entityField", filter: { types: ["type.price"] } }}
  />
);
