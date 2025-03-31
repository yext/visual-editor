import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";

type Option<T = any> = {
  label: string;
  value: T;
  color?: string;
};

export const BasicSelector = (label: string, options: Option[]): Field => {
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
            <p>No options available</p>
          </FieldLabel>
        );
      }
      const stringifiedValue: string = JSON.stringify(value);
      const stringifiedOptions: Option<string>[] = options.map((option) => ({
        ...option,
        value: JSON.stringify(option.value) as string,
      }));
      return (
        <FieldLabel label={label} icon={<ChevronDown size={16} />}>
          <Combobox
            defaultValue={
              stringifiedOptions.find(
                (option) => option.value === stringifiedValue
              ) ?? stringifiedOptions[0]
            }
            onChange={(selectedOption) =>
              onChange(
                options.find(
                  (option) => JSON.stringify(option.value) === selectedOption
                )?.value ?? options[0].value
              )
            }
            options={stringifiedOptions}
          />
        </FieldLabel>
      );
    },
  };
};
