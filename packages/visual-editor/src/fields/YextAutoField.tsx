import React from "react";
import { AutoField, type FieldProps } from "@puckeditor/core";
import { toPuckFields, type YextFieldDefinition } from "./fields.ts";
import {
  isYextOverrideType,
  YextPuckFieldOverrides,
} from "./fieldOverrides.ts";

type YextAutoFieldProps<ValueType = any> = Omit<
  FieldProps<any, ValueType>,
  "field"
> & {
  field: YextFieldDefinition<ValueType>;
  value: ValueType;
};

export const YextAutoField = <ValueType,>({
  field,
  ...props
}: YextAutoFieldProps<ValueType>) => {
  if (isYextOverrideType(field.type)) {
    const FieldOverride = YextPuckFieldOverrides[field.type];

    return <FieldOverride field={field} {...(props as any)} />;
  }

  // Custom fields avoid Puck's default child renderer for Yext field types.
  // Use the shared renderer so field updates do not mount nested controls again.
  const normalizedField = React.useMemo(
    () => toPuckFields({ value: field }).value,
    [field]
  );

  return <AutoField field={normalizedField} {...(props as any)} />;
};
