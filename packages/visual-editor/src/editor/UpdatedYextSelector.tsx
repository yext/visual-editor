/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { IMAGE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Image.tsx";
import { EntityFieldInput } from "./YextEntityFieldSelector.tsx";

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
      console.log("value", value);
      console.log("onChange", onChange);

      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <EntityFieldInput<U>
            onChange={onChange}
            value={value}
            filter={props.filter}
          />
          <AutoField
            onChange={(newConstantValue) =>
              onChange({
                field: value?.field ?? "",
                constantValue: {
                  ...value.constantValue,
                  image: newConstantValue,
                },
                constantValueOverride: {
                  ...value.constantValueOverride,
                  ["image"]: true,
                },
              })
            }
            value={value?.constantValue?.image}
            field={IMAGE_CONSTANT_CONFIG}
          />
          {/**  field per subfield which looks like two options 1. entityField or 2. constValue (can use YextEntityFieldSelector i guess)*/}
        </FieldLabel>
      );
    },
  };
};

type InputPropsV2 = {
  filter: EntityFieldTypesFilter;
  onChange: (value: any, uiState: any) => void;
  value: any;
};

const SubfieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
}: InputPropsV2) => {
  // get subfields for field selected
  const hardCodedSubfields = ["image", "primaryCta", "secondaryCta"];
  // get fieldConfig for each subfield

  console.log(value?.field);
  return <></>;
  // if not list then return YextEntityFieldSelector per subfield (but YextEntityFieldSelector should only have one option for entityValue)
};

// Dropdown for entity value (has None option for list case)
// field per subfield (except list case) which looks like two options 1. entityField or 2. constValue (can use YextEntityFieldSelector i guess)
// if dropdown has none selected (only list case), only constValues usable
