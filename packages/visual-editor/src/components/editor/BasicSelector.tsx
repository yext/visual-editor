import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";

export const BasicSelector = (
  label: string,
  options: { label: string; value: any; color?: string }[]
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
      return (
        <FieldLabel label={label} icon={<ChevronDown size={16} />}>
          <Combobox
            defaultValue={
              options.find((option) => option.value === value) ?? options[0]
            }
            onChange={onChange}
            options={options}
          />
        </FieldLabel>
      );
    },
  };
};
