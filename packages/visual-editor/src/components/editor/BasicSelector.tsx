import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import { Combobox } from "../../internal/puck/ui/Combobox.tsx";

export const BasicSelector = (
  label: string,
  options: { label: string; value: any }[]
): Field => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      return (
        <FieldLabel label={label} icon={<ChevronDown size={16} />}>
          <Combobox
            defaultValue={
              options.find((option) => option.value === value) ?? options[0]
            }
            // option from onChange is the label of the selected option, but Puck's onChange expects the value
            onChange={(option: any) =>
              onChange(
                (options.find((o) => o.label === option) ?? options[0]).value
              )
            }
            options={options}
          />
        </FieldLabel>
      );
    },
  };
};
