import React from "react";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
  getConstantConfigFromType,
} from "./YextEntityFieldSelector.tsx";
import { getSubfieldsFromType } from "../internal/puck/Subfields.ts";
import "./index.css";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

type EntityFieldTypesFilter = {
  type: EntityFieldTypesV2;
};

// EntityFieldTypesV2 contains new struct types that we support overriding individual subfields for
export type EntityFieldTypesV2 = "type.hero_section";

// YextEntityFieldV2 keeps track of which fields we are allowing individual overriding for using constantValueOverride
export type YextEntityFieldV2<T extends Record<string, any> = any> = {
  field: string;
  constantValue: T;
  constantValueOverride: {
    [K in keyof T]: boolean;
  };
};

export type SelectorPropsV2 = {
  label: string;
  filter: EntityFieldTypesFilter;
};

// YextSelectorV2 will be used for new built-in struct and list field types.
export const YextSelectorV2 = <U extends Record<string, any>>(
  props: SelectorPropsV2
): CustomField<YextEntityFieldV2<U>> => {
  const filter = {
    types: [props.filter.type],
  };

  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <EntityFieldInput<U>
            onChange={onChange}
            value={value}
            filter={filter}
          />
          <SubfieldsInput
            onChange={onChange}
            value={value}
            filter={props.filter}
          />
        </FieldLabel>
      );
    },
  };
};

type InputPropsV2 = {
  filter: EntityFieldTypesFilter;
  onChange: (value: any, uiState?: any) => void;
  value: any;
};

// SubfieldsInput renders the subfields such that users can choose to toggle between the
// inferred entityValue (from field) being used or use a constantValue.
const SubfieldsInput = ({ filter, onChange, value }: InputPropsV2) => {
  const subfields = getSubfieldsFromType(filter.type);
  if (!subfields) {
    return;
  }

  return (
    <FieldLabel
      label="Subfield Assignments"
      className="ve-inline-block ve-w-full pt-4"
    >
      {subfields.map(({ field, type, label }, idx: number) => {
        const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
          onChange({
            constantValueOverride: {
              ...value?.constantValueOverride,
              [field]: constantValueEnabled,
            },
            field: value?.field,
            constantValue: value?.constantValue,
          });
        };

        const constantConfig = getConstantConfigFromType(type);
        if (!constantConfig) {
          return;
        }

        return (
          <div key={idx} className="ObjectField">
            <div className="ObjectField-fieldset">
              <FieldLabel label={label}>
                <ConstantValueModeToggler
                  fieldTypeFilter={[type]}
                  constantValueEnabled={value?.constantValueOverride?.[field]}
                  toggleConstantValueEnabled={toggleConstantValueEnabled}
                />
                {value?.constantValueOverride?.[field] && (
                  <AutoField
                    onChange={(newConstantValue, uiState) =>
                      onChange(
                        {
                          field: value?.field,
                          constantValue: {
                            ...value?.constantValue,
                            [field]: newConstantValue,
                          },
                          constantValueOverride: {
                            ...value?.constantValueOverride,
                            [field]: true,
                          },
                        },
                        uiState
                      )
                    }
                    value={value.constantValue?.[field]}
                    field={constantConfig}
                  />
                )}
              </FieldLabel>
            </div>
          </div>
        );
      })}
    </FieldLabel>
  );
};
