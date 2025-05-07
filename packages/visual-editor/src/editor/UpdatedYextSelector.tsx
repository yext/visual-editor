/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
  getConstantConfigFromType,
} from "./YextEntityFieldSelector.tsx";
import "./index.css";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

type EntityFieldTypesFilter = {
  types?: EntityFieldTypes[];
};

type EntityFieldTypes = "c_hero";

export type YextEntityFieldV2<T extends Record<string, any> = any> = {
  field: string;
  constantValue: T;
  constantValueOverride?: {
    [K in keyof T]?: boolean;
  };
};

export type SelectorPropsV2 = {
  label: string;
  filter: EntityFieldTypesFilter;
};

export const YextSelectorV2 = <U extends Record<string, any>>(
  props: SelectorPropsV2
): CustomField<YextEntityFieldV2<U>> => {
  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <EntityFieldInput<U>
            onChange={onChange}
            value={value}
            filter={props.filter}
          />
          <SubfieldInput
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

const SubfieldInput = ({ filter, onChange, value }: InputPropsV2) => {
  // const subfields = getSubfields("c_hero")
  const hardCodedSubfields = [
    { field: "image", type: "type.image", label: "Image" },
    { field: "primaryCta", type: "type.cta", label: "Primary CTA" },
    { field: "secondaryCta", type: "type.cta", label: "Secondary CTA" },
  ] as const;

  return (
    <FieldLabel
      label="Subfield Assignments"
      className="ve-inline-block ve-w-full pt-4"
    >
      {hardCodedSubfields.map(({ field, type, label }, idx: number) => {
        const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
          onChange({
            constantValueOverride: {
              ...value.constantValueOverride,
              [field]: constantValueEnabled,
            },
            field: value.field,
            constantValue: value.constantValue,
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
                  constantValueEnabled={value.constantValueOverride?.[field]}
                  toggleConstantValueEnabled={toggleConstantValueEnabled}
                />
                {value.constantValueOverride?.[field] && (
                  <AutoField
                    onChange={(newConstantValue, uiState) =>
                      onChange(
                        {
                          field: value.field,
                          constantValue: {
                            ...value.constantValue,
                            [field]: newConstantValue,
                          },
                          constantValueOverride: {
                            ...value.constantValueOverride,
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

// Dropdown for entity value (has None option for list case)
// field per subfield (except list case) which looks like two options 1. entityField or 2. constValue (can use YextEntityFieldSelector i guess)
// if dropdown has none selected (only list case), only constValues usable
