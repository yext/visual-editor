import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import {
  Combobox,
  ComboboxOption,
  ComboboxOptionGroup,
} from "../internal/puck/ui/Combobox.tsx";
import { pt } from "../utils/i18nPlatform.ts";
import { Button } from "../internal/puck/ui/button.tsx";

type BasicSelectorProps = {
  label: string;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string;
  noOptionsMessage?: string;
  disableSearch?: boolean;
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

export const BasicSelector = (props: BasicSelectorProps): Field => {
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
  } = props;

  return {
    type: "custom",
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
            <FieldLabel label={label} icon={<ChevronDown size={16} />} />
            <Button variant="puckSelect" disabled={true}>
              {noOptionsPlaceholder}
            </Button>
            {noOptionsMessage && (
              <p className="ve-text-xs ve-mt-3">{noOptionsMessage}</p>
            )}
          </>
        );
      }

      return (
        <FieldLabel label={pt(label)} icon={<ChevronDown size={16} />}>
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
        </FieldLabel>
      );
    },
  };
};
