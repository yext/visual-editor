import { useTranslation } from "react-i18next";
import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { ChevronDown } from "lucide-react";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";

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
      const { t } = useTranslation();
      if (!options || options.length === 0) {
        return (
          <FieldLabel label={label} icon={<ChevronDown size={16} />}>
            <p>{t("basicSelectorNoOptionsLabel", "No options available")}</p>
          </FieldLabel>
        );
      }

      // The values that we pass into the Combobox should match the labels
      // so that the search functionality works as expected.
      const labelOptions: Option<string>[] = options.map((option) => ({
        ...option,
        value: option.label,
      }));

      return (
        <FieldLabel label={label} icon={<ChevronDown size={16} />}>
          <Combobox
            defaultValue={
              labelOptions[
                options.findIndex(
                  (option) =>
                    JSON.stringify(option.value) === JSON.stringify(value)
                )
              ] ?? labelOptions[0]
            }
            onChange={(selectedOption) =>
              onChange(
                options.find((option) => option.label === selectedOption)
                  ?.value ?? options[0].value
              )
            }
            options={labelOptions}
          />
        </FieldLabel>
      );
    },
  };
};
