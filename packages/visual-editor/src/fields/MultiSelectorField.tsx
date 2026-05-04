import { BaseField, type FieldProps, type UiState } from "@puckeditor/core";
import { YextAutoField } from "./YextAutoField.tsx";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { type YextArrayField } from "./fields.ts";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";

export type MultiSelectorOptionValue = string | number | boolean;

type MultiSelectorOptionSelection<T extends MultiSelectorOptionValue> = {
  value: T | undefined;
};

export interface MultiSelectorValue<T extends MultiSelectorOptionValue> {
  selections: MultiSelectorOptionSelection<T>[];
}

export interface MultiSelectorOption<T extends MultiSelectorOptionValue> {
  label: string;
  value: T | undefined;
}

export type MultiSelectorOptions<T extends MultiSelectorOptionValue> =
  | MultiSelectorOption<T>[]
  | (() => MultiSelectorOption<T>[]);

/**
 * A field type for selecting multiple values from a static or dynamic list of
 * options.
 *
 * Example:
 *
 * ```tsx
 * const fields: YextFields<MyComponentProps> = {
 *   filters: {
 *     type: "multiSelector",
 *     label: msg("fields.filters", "Filters"),
 *     dropdownLabel: msg("fields.field", "Field"),
 *     options: [
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
export type MultiSelectorField<T extends MultiSelectorOptionValue = any> =
  BaseField & {
    type: "multiSelector";
    label: string | MsgString;
    dropdownLabel: string | MsgString;
    options: MultiSelectorOptions<T>;
    placeholderOptionLabel?: string | MsgString;
  };

type MultiSelectorFieldProps<T extends MultiSelectorOptionValue> = FieldProps<
  MultiSelectorField<T>,
  MultiSelectorValue<T> | undefined
>;

const getDefaultSelection = <
  T extends MultiSelectorOptionValue,
>(): MultiSelectorOptionSelection<T> => ({
  value: undefined,
});

/** A multi-select field whose options may be static or loaded from a function. */
export const MultiSelectorFieldOverride = <T extends MultiSelectorOptionValue>({
  field,
  value,
  onChange,
  id,
  readOnly,
}: MultiSelectorFieldProps<T>) => {
  const allOptions =
    typeof field.options === "function" ? field.options() : field.options;
  const selectedValues = value?.selections ?? [];

  return (
    <div className="ve-pt-3">
      <div className="ve-mb-2 ve-text-sm ve-font-medium ve-leading-none">
        {pt(field.label)}
      </div>
      <YextAutoField
        id={id ? `${id}_selections` : undefined}
        readOnly={readOnly}
        field={MultiSelectorArrayField(
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

const MultiSelectorArrayField = <T extends MultiSelectorOptionValue>(
  options: MultiSelectorOption<T>[],
  dropdownLabel: string | MsgString,
  placeholderOptionLabel?: string | MsgString
): YextArrayField<MultiSelectorOptionSelection<T>[]> => {
  const dropdownOptions = [...options];
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
