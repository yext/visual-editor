import {
  ArrayField,
  AutoField,
  UiState,
  Field,
  FieldLabel,
} from "@measured/puck";
import { useMemo } from "react";
import { pt } from "../utils/i18n/platform.ts";

export type DynamicOptionValueTypes =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;

type DynamicOptionsSelectorProps<T extends DynamicOptionValueTypes> = {
  label: string;
  dropdownLabel: string;
  getOptions: () => DynamicOption<T>[];
  placeholderOptionLabel?: string;
};

interface DynamicOptionItem<T extends DynamicOptionValueTypes> {
  value: T;
}

export interface DynamicOptionsSelectorType<T extends DynamicOptionValueTypes> {
  options: DynamicOption<T>[];
}

export interface DynamicOption<T extends DynamicOptionValueTypes> {
  label: string;
  value: T;
}

const getDefaultDynamicOptions = <
  T extends DynamicOptionValueTypes,
>(): DynamicOptionItem<T> => ({
  value: undefined as T,
});

/**
 * A selector component for dynamic options. The options can be loaded from a function that uses hooks.
 */
export const DynamicOptionsSelector = <T extends DynamicOptionValueTypes>(
  props: DynamicOptionsSelectorProps<T>
): Field<DynamicOptionsSelectorType<T> | undefined> => {
  return {
    type: "custom",
    render: ({
      value,
      onChange,
    }: {
      value: DynamicOptionsSelectorType<T> | undefined;
      onChange: (
        value: DynamicOptionsSelectorType<T> | undefined,
        uiState?: Partial<UiState>
      ) => void;
    }) => {
      const options = props.getOptions();
      const optionsValue = value?.options ?? [];
      return (
        <FieldLabel label={pt(props.label)}>
          <AutoField
            field={DynamicOptionsArrayField(
              options,
              props.dropdownLabel,
              props.placeholderOptionLabel
            )}
            value={optionsValue}
            onChange={(newValue, uiState) =>
              onChange({ options: newValue }, uiState)
            }
          />
        </FieldLabel>
      );
    },
  };
};

const DynamicOptionsArrayField = <T extends DynamicOptionValueTypes>(
  options: DynamicOption<T>[],
  dropdownLabel: string,
  placeholderOptionLabel?: string
): ArrayField<DynamicOptionItem<T>[]> => {
  // Memoize the dropdown field definition
  const dropdownField = useMemo(() => {
    const dropdownOptions = options.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }));
    if (placeholderOptionLabel) {
      dropdownOptions.unshift({
        label: placeholderOptionLabel,
        value: undefined as T,
      });
    }
    return {
      label: dropdownLabel,
      type: "select" as const,
      options: dropdownOptions,
    };
  }, [options]);

  return {
    type: "array",
    arrayFields: {
      value: dropdownField,
    },
    defaultItemProps: getDefaultDynamicOptions<T>(),
    getItemSummary: (item, i) => {
      const opt = options.find((opt) => String(opt.value) === item.value);
      if (opt) {
        return pt(opt.label);
      }
      return pt(dropdownLabel) + " " + ((i ?? 0) + 1);
    },
  };
};
