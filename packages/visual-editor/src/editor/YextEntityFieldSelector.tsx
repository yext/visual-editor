import { type Field } from "@puckeditor/core";
import {
  type EntityFieldSelectorField,
  ConstantValueModeToggler,
  ConstantValueInput,
  EntityFieldInput,
  TYPE_TO_CONSTANT_CONFIG,
  getConstantConfigFromType,
  returnConstantFieldConfig,
} from "../fields/EntityFieldSelectorField.tsx";
import { type YextEntityField } from "./yextEntityFieldUtils.ts";

export type { YextEntityField } from "./yextEntityFieldUtils.ts";

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  Omit<EntityFieldSelectorField<T>, "type" | "label"> & {
    label: string;
  };

/**
 * @deprecated Prefer authoring `{ type: "entityField", ... }` directly in
 * `YextFields`. This wrapper remains for backwards compatibility.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  const field: EntityFieldSelectorField<T> = {
    type: "entityField",
    label: props.label,
    filter: props.filter,
    constantValueFilter: props.constantValueFilter,
    disableConstantValueToggle: props.disableConstantValueToggle,
    disallowTranslation: props.disallowTranslation,
  };

  return field as unknown as Field<YextEntityField<U>>;
};

export {
  ConstantValueModeToggler,
  ConstantValueInput,
  EntityFieldInput,
  TYPE_TO_CONSTANT_CONFIG,
  getConstantConfigFromType,
  returnConstantFieldConfig,
} from "../fields/EntityFieldSelectorField.tsx";
