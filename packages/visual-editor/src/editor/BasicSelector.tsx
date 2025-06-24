import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { pt } from "../utils/i18nPlatform.ts";
import { Button } from "../internal/puck/ui/button.tsx";

type Option<T = any> = {
  label: string;
  value: T;
  color?: string;
};

type BasicSelectorProps = {
  label: string;
  options: Option[];
  translateOptions?: boolean;
  noOptionsPlaceholder?: string;
  noOptionsMessage?: string;
  icon?: React.ReactNode;
};

export const BasicSelector = (props: BasicSelectorProps): Field => {
  const {
    label,
    options,
    translateOptions = true,
    noOptionsPlaceholder = pt(
      "basicSelectorNoOptionsLabel",
      "No options available"
    ),
    noOptionsMessage,
    icon = <ChevronDown size={16} />,
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
      if (!options?.length) {
        return (
          <>
            <FieldLabel label={label} icon={icon} />
            <Button
              variant="outline"
              className="ve-w-full ve-justify-between ve-rounded-sm"
              disabled={true}
            >
              {noOptionsPlaceholder}
              <ChevronsUpDown className="ve-ml-2 ve-h-4 ve-w-4 ve-shrink-0 ve-opacity-50" />
            </Button>
            {noOptionsMessage && (
              <p className="ve-text-xs ve-mt-3">{noOptionsMessage}</p>
            )}
          </>
        );
      }

      const translatedOptions = translateOptions
        ? options.map((o) => ({
            ...o,
            label: pt(o.label),
          }))
        : options;

      // The values that we pass into the Combobox should match the labels
      // so that the search functionality works as expected.
      const labelOptions: Option<string>[] = translatedOptions.map(
        (option) => ({
          ...option,
          value: option.label,
        })
      );

      return (
        <FieldLabel label={pt(label)} icon={icon}>
          <Combobox
            defaultValue={
              labelOptions[
                translatedOptions.findIndex(
                  (option) =>
                    JSON.stringify(option.value) === JSON.stringify(value)
                )
              ] ?? labelOptions[0]
            }
            onChange={(selectedOption) =>
              onChange(
                translatedOptions.find(
                  (option) => option.label === selectedOption
                )?.value ?? options[0].value
              )
            }
            options={labelOptions}
            disabled={!translatedOptions?.length}
          />
        </FieldLabel>
      );
    },
  };
};
