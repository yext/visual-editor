import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { pt } from "../utils/i18nPlatform.ts";

type Option<T = any> = {
  label: string;
  value: T;
  color?: string;
};

export const BasicSelector = (
  label: string,
  options: Option[],
  translateOptions: boolean = true
): Field => {
  return {
    type: "custom",
    render: ({
      value,
      onChange,
    }: {
      value: any;
      onChange: (selectedOption: any) => void;
    }) => {
      if (!options || options.length === 0) {
        return (
          <FieldLabel label={label} icon={<ChevronDown size={16} />}>
            <p>{pt("basicSelectorNoOptionsLabel", "No options available")}</p>
          </FieldLabel>
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
        <FieldLabel label={pt(label)} icon={<ChevronDown size={16} />}>
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
          />
        </FieldLabel>
      );
    },
  };
};
