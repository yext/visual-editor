import { BaseField, type FieldProps, type UiState } from "@puckeditor/core";
import { YextAutoField } from "./YextAutoField.tsx";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { type YextArrayField } from "../editor/YextField.tsx";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";

export type DynamicOptionValueTypes = string | number | boolean;

type DynamicOptionSelection<T extends DynamicOptionValueTypes> = {
  value: T | undefined;
};

export interface DynamicMultiSelectValue<T extends DynamicOptionValueTypes> {
  selections: DynamicOptionSelection<T>[];
}

export interface DynamicOption<T extends DynamicOptionValueTypes> {
  label: string;
  value: T | undefined;
}

/**
 * A field type for selecting multiple values from options loaded at render time.
 *
 * Example:
 *
 * ```tsx
 * const fields: YextFields<MyComponentProps> = {
 *   filters: {
 *     type: "dynamicMultiSelect",
 *     label: msg("fields.filters", "Filters"),
 *     dropdownLabel: msg("fields.field", "Field"),
 *     getOptions: () => [
 *       { label: msg("fields.city", "City"), value: "address.city" },
 *       { label: msg("fields.region", "Region"), value: "address.region" },
 *     ],
 *     placeholderOptionLabel: msg("fields.selectAField", "Select a field"),
 *   },
 * };
 * ```
 *
 * The saved value shape is:
 *
 * ```ts
 * { selections: [{ value: "address.city" }] }
 * ```
 */
export type DynamicMultiSelectField<T extends DynamicOptionValueTypes = any> =
  BaseField & {
    type: "dynamicMultiSelect";
    label: string | MsgString;
    dropdownLabel: string | MsgString;
    getOptions: () => DynamicOption<T>[];
    placeholderOptionLabel?: string | MsgString;
  };

type DynamicMultiSelectFieldProps<T extends DynamicOptionValueTypes> =
  FieldProps<
    DynamicMultiSelectField<T>,
    DynamicMultiSelectValue<T> | undefined
  >;

const getDefaultSelection = <
  T extends DynamicOptionValueTypes,
>(): DynamicOptionSelection<T> => ({
  value: undefined,
});

/**
 * A multi-select field whose options are loaded from a function. The options
 * function may use hooks.
 */
export const DynamicMultiSelectFieldOverride = <
  T extends DynamicOptionValueTypes,
>({
  field,
  value,
  onChange,
  id,
  readOnly,
}: DynamicMultiSelectFieldProps<T>) => {
  const allOptions = field.getOptions();
  const selectedValues = value?.selections ?? [];

  return (
    <div className="ve-pt-3">
      <div className="ve-mb-2 ve-text-sm ve-font-medium ve-leading-none">
        {pt(field.label)}
      </div>
      <YextAutoField
        id={id ? `${id}_selections` : undefined}
        readOnly={readOnly}
        field={DynamicMultiSelectArrayField(
          allOptions,
          field.dropdownLabel,
          field.placeholderOptionLabel
        )}
        value={selectedValues}
        onChange={(newValue, uiState?: Partial<UiState>) =>
          onChange(
            newValue.length > 0 ? { selections: newValue } : undefined,
            uiState
          )
        }
      />
    </div>
  );
};

const DynamicMultiSelectArrayField = <T extends DynamicOptionValueTypes>(
  options: DynamicOption<T>[],
  dropdownLabel: string | MsgString,
  placeholderOptionLabel?: string | MsgString
): YextArrayField<DynamicOptionSelection<T>[]> => {
  const dropdownOptions = options.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));
  if (placeholderOptionLabel) {
    dropdownOptions.unshift({
      label: placeholderOptionLabel,
      value: undefined,
    });
  }
  const dropdownField: BasicSelectorField = {
    label: dropdownLabel,
    type: "basicSelector",
    options: dropdownOptions,
  };

  return {
    type: "array",
    arrayFields: {
      value: dropdownField,
    },
    defaultItemProps: getDefaultSelection<T>(),
    getItemSummary: (item, i) => {
      const opt = options.find((opt) => opt.value === item.value);
      if (opt) {
        return pt(opt.label);
      }
      return pt(dropdownLabel) + " " + ((i ?? 0) + 1);
    },
  };
};
