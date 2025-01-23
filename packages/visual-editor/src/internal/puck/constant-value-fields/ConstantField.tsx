import React, { ReactElement } from "react";
import { AutoField, FieldLabel } from "@measured/puck";

type ConstantFieldProps = {
  label: string;
  field: string;
  fieldType: "text" | "number";
};

type ConstantFieldsProps<T extends Record<string, any>> = {
  onChange(value: T): void;
  value: T;
  fields: ConstantFieldProps[];
};
export function ConstantFields<T extends Record<string, any>>(
  props: ConstantFieldsProps<T>
): ReactElement {
  const fields: ReactElement[] = [];
  props.fields.forEach((field) => {
    fields.push(ConstantField<T>(props, field));
  });

  return <>{fields}</>;
}

function ConstantField<T extends Record<string, any>>(
  props: ConstantFieldsProps<T>,
  fieldProps: ConstantFieldProps
): ReactElement {
  return (
    <FieldLabel
      label={fieldProps.label}
      className="ve-inline-block ve-pt-4 w-full"
      key={`constant-${fieldProps.field}-label`}
    >
      <AutoField
        field={{ type: fieldProps.fieldType }}
        value={props.value[fieldProps.field] as T}
        onChange={(fieldValue) => {
          props.onChange({
            ...props.value,
            [fieldProps.field]: fieldValue,
          });
        }}
      />
    </FieldLabel>
  );
}
