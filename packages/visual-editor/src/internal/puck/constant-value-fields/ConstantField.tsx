import React, { ReactElement } from "react";
import { AutoField, FieldLabel } from "@measured/puck";

type ConstantFieldOption = {
  label: string;
  value: string;
};

type ConstantFieldProps = {
  label: string;
  field: string;
  fieldType: "text" | "number" | "select";
  options?: ConstantFieldOption[];
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
        field={{ type: fieldProps.fieldType, options: fieldProps.options }}
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
