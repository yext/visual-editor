/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomField, FieldLabel } from "@measured/puck";
import {
  EntityFieldInput,
  YextEntityFieldSelector,
} from "./YextEntityFieldSelector.tsx";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

type EntityFieldTypesFilter<T> = {
  types?: EntityFieldTypes[];
};

type EntityFieldTypes = "c_hero";

export type YextEntityFieldV2<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean; // really means toggled
};

export type SelectorPropsV2<T extends Record<string, any>> = {
  label: string;
  filter: EntityFieldTypesFilter<T>;
};

export const YextSelectorV2 = <T extends Record<string, any>, U>(
  props: SelectorPropsV2<T>
): CustomField<YextEntityFieldV2<U>> => {
  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      console.log("value", value);
      console.log("onChange", onChange);

      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <EntityFieldInput<T>
            onChange={onChange}
            value={value}
            filter={props.filter}
          />
          {value?.field && (
            <Subfields
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          )}
          {/**  field per subfield which looks like two options 1. entityField or 2. constValue (can use YextEntityFieldSelector i guess)*/}
        </FieldLabel>
      );
    },
  };
};

type InputPropsV2<T extends Record<string, any>> = {
  filter: EntityFieldTypesFilter<T>;
  onChange: (value: any, uiState: any) => void;
  value: any;
};

const Subfields = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
}: InputPropsV2<T>) => {
  // get subfields for field selected
  const hardCodedSubfields = ["image", "primaryCta", "secondaryCta"];

  return YextEntityFieldSelector({
    label: "Image",
    filter: {
      types: ["type.image"],
      directChildrenOf: value?.field,
    },
  }) as JSX.Element;
  // if not list then return YextEntityFieldSelector per subfield (but YextEntityFieldSelector should only have one option for entityValue)
};

// Dropdown for entity value (has None option for list case)
// field per subfield (except list case) which looks like two options 1. entityField or 2. constValue (can use YextEntityFieldSelector i guess)
// if dropdown has none selected (only list case), only constValues usable
