import {
  ArrayField,
  AutoField,
  UiState,
  Field,
  FieldLabel,
} from "@measured/puck";
import { pt } from "../utils/i18n/platform.ts";

export type DynamicOptionValueTypes = string | number | boolean | object;

type DynamicOptionsSelectorProps<T extends DynamicOptionValueTypes> = {
  label: string;
  dropdownLabel: string;
  getOptions: () => DynamicOption<T>[];
  placeholderOptionLabel?: string;
};

interface DynamicOptionSelection<T extends DynamicOptionValueTypes> {
  value: T | undefined;
}

export interface DynamicOptionsSelectorType<T extends DynamicOptionValueTypes> {
  selections: DynamicOptionSelection<T>[];
}

export interface DynamicOptionsSingleSelectorType<
  T extends DynamicOptionValueTypes,
> {
  selection: DynamicOptionSelection<T>;
}

export interface DynamicOption<T extends DynamicOptionValueTypes> {
  label: string;
  value: T | undefined;
}

const getDefaultSelection = <
  T extends DynamicOptionValueTypes,
>(): DynamicOptionSelection<T> => ({
  value: undefined,
});

/**
 * A multi selector component for dynamic options. The options can be loaded from a function that
 * uses hooks.
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
      const allOptions = props.getOptions();
      const selectedValues = value?.selections ?? [];
      return (
        <FieldLabel label={pt(props.label)}>
          <AutoField
            field={DynamicOptionsArrayField(
              allOptions,
              props.dropdownLabel,
              props.placeholderOptionLabel
            )}
            value={selectedValues}
            onChange={(newValue, uiState) =>
              onChange({ selections: newValue }, uiState)
            }
          />
        </FieldLabel>
      );
    },
  };
};

/**
 * A single selector component for dynamic options. The options can be loaded from a function that
 * uses hooks.
 */
export const DynamicOptionsSingleSelector = <T extends DynamicOptionValueTypes>(
  props: DynamicOptionsSelectorProps<T>
): Field<DynamicOptionsSingleSelectorType<T> | undefined> => {
  return {
    type: "custom",
    render: ({
      value,
      onChange,
    }: {
      value: DynamicOptionsSingleSelectorType<T> | undefined;
      onChange: (
        value: DynamicOptionsSingleSelectorType<T> | undefined,
        uiState?: Partial<UiState>
      ) => void;
    }) => {
      const allOptions = props.getOptions();
      const selectedValue = value?.selection ?? { value: undefined };
      return (
        <FieldLabel label={pt(props.label)}>
          <AutoField
            field={DynamicOptionsSingleSelectField(
              allOptions,
              props.dropdownLabel,
              props.placeholderOptionLabel
            )}
            value={selectedValue.value}
            onChange={(newValue, uiState) =>
              onChange({ selection: { value: newValue } }, uiState)
            }
          />
        </FieldLabel>
      );
    },
  };
};

const DynamicOptionsSingleSelectField = <T extends DynamicOptionValueTypes>(
  options: DynamicOption<T>[],
  dropdownLabel: string,
  placeholderOptionLabel?: string
): Field<DynamicOptionSelection<T> | undefined> => {
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
  return {
    label: dropdownLabel,
    type: "select" as const,
    options: dropdownOptions,
  };
};

const DynamicOptionsArrayField = <T extends DynamicOptionValueTypes>(
  options: DynamicOption<T>[],
  dropdownLabel: string,
  placeholderOptionLabel?: string
): ArrayField<DynamicOptionSelection<T>[]> => {
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
  const dropdownField = {
    label: dropdownLabel,
    type: "select" as const,
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
