import React from "react";
import { AutoField, Field, type FieldProps } from "@puckeditor/core";
import { YextPuckFieldOverrides, YextPuckFields } from "./fields.ts";

type YextAutoFieldProps<ValueType = any> = Omit<
  FieldProps<any, ValueType>,
  "field"
> & {
  field: Field<ValueType> | YextPuckFields[keyof YextPuckFields];
  value: ValueType;
};

type YextOverrideType = keyof typeof YextPuckFieldOverrides;

const isYextOverrideType = (type: string): type is YextOverrideType =>
  type in YextPuckFieldOverrides;

export const YextAutoField = <ValueType,>({
  field,
  ...props
}: YextAutoFieldProps<ValueType>) => {
  if (isYextOverrideType(field.type)) {
    const FieldOverride = YextPuckFieldOverrides[field.type];

    return <FieldOverride field={field} {...(props as any)} />;
  }

  return <AutoField field={field} {...(props as any)} />;
};
