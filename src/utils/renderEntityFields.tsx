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

type RenderProps = Parameters<CustomField<any>["render"]>[0];

type RenderEntityFields<T extends RenderProps> = {
  renderProps: RenderProps;
  fieldName: keyof T["value"];
  objectFields?: ObjectField<any>["objectFields"];
  filter?: RenderEntityFieldFilter;
};

export const renderEntityFields = <T extends RenderProps>({
  renderProps,
  fieldName,
  objectFields,
  filter,
}: RenderEntityFields<T>) => {
  const filteredEntityFields = getFilteredEntityFields(filter);

  const selectorField: any = {};
  selectorField[fieldName] = {
    label: "Entity Field",
    type: "select",
    options: filteredEntityFields.map((field) => {
      return { label: field.name, value: field.name };
    }),
  };

  return (
    <>
      <FieldLabel label={renderProps.field.label!}>
        <AutoField
          field={{
            type: "object",
            objectFields: {
              ...selectorField,
              ...objectFields,
            },
          }}
          onChange={(value) => renderProps.onChange(value)}
          value={renderProps.value}
        />
      </FieldLabel>
    </>
  );
};
