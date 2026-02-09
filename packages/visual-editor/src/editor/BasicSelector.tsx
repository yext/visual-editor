import React from "react";
import { BaseField, Field, FieldLabel } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { pt } from "../utils/i18n/platform.ts";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";

type BasicSelectorProps = {
  label?: string;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string;
  noOptionsMessage?: string;
  disableSearch?: boolean;
  ai?: BaseField["ai"];
} & (
  | {
      options: ComboboxOption[];
      optionGroups?: never;
    }
  | {
      options?: never;
      optionGroups: ComboboxOptionGroup[];
    }
);

export const BasicSelector = <T,>(props: BasicSelectorProps): Field<T> => {
  const {
    label,
    options = [],
    optionGroups = [{ options }],
    translateOptions = true,
    noOptionsPlaceholder = pt(
      "basicSelectorNoOptionsLabel",
      "No options available"
    ),
    noOptionsMessage,
    disableSearch,
    ai,
  } = props;

  return {
    type: "custom",
    ai,
    render: ({
      value,
      onChange,
    }: {
      value: any;
      onChange: (selectedOption: any) => void;
    }) => {
      const translatedOptionGroups = translateOptions
        ? optionGroups.map((group) => {
            return {
              title: group.title && pt(group.title),
              description: group.description && pt(group.description),
              options: group.options.map((option) => ({
                ...option,
                label: pt(option.label),
              })),
            };
          })
        : optionGroups;
      const serializedOptions = translatedOptionGroups.reduce(
        (prev, group) => prev.concat(group.options),
        [] as ComboboxOption[]
      );
      const noOptions = serializedOptions.length === 0;

      if (noOptions) {
        return (
          <>
            {label && <FieldLabel label={label} />}
            <Button variant="puckSelect" disabled={true}>
              {noOptionsPlaceholder}
            </Button>
            {noOptionsMessage && (
              <p className="ve-text-xs ve-mt-3">{noOptionsMessage}</p>
            )}
          </>
        );
      }

      const Selector = (
        <Combobox
          selectedOption={
            serializedOptions.find(
              (v) => JSON.stringify(v.value) === JSON.stringify(value)
            ) ?? serializedOptions[0]
          }
          onChange={onChange}
          optionGroups={translatedOptionGroups}
          disabled={noOptions}
          disableSearch={disableSearch}
        />
      );

      return label ? (
        <FieldLabel label={pt(label)}>{Selector}</FieldLabel>
      ) : (
        Selector
      );
    },
  };
};
