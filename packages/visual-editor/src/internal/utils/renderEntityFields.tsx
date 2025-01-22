import * as React from "react";
import {
  AutoField,
  CustomField,
  FieldLabel,
  ObjectField,
} from "@measured/puck";
import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "./getFilteredEntityFields.ts";

export type RenderProps = Parameters<CustomField<any>["render"]>[0];

type RenderEntityFields<
  T extends RenderProps,
  U extends Record<string, any>,
> = {
  renderProps: RenderProps;
  fieldName: keyof T["value"];
  objectFields?: ObjectField<any>["objectFields"];
  filter: RenderEntityFieldFilter<U>;
};

export const renderEntityFields = <
  T extends RenderProps,
  U extends Record<string, any>,
>(
  props: RenderEntityFields<T, U>
) => {
  const filteredEntityFields = getFilteredEntityFields(props.filter);

  const selectorField: any = {};
  selectorField[props.fieldName] = {
    label: "Entity Field",
    type: "select",
    options: filteredEntityFields.map((field) => {
      return { label: field.name, value: field.name };
    }),
  };

  return (
    <>
      <FieldLabel label={props.renderProps.field.label!}>
        <AutoField
          field={{
            type: "object",
            objectFields: {
              ...selectorField,
              ...props.objectFields,
            },
          }}
          onChange={(value) => props.renderProps.onChange(value)}
          value={props.renderProps.value}
        />
      </FieldLabel>
    </>
  );
};
