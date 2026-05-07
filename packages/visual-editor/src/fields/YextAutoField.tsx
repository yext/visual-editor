import React from "react";
import { AutoField, type FieldProps } from "@puckeditor/core";
import type { YextFieldDefinition } from "./fields.ts";
import { YextPuckFieldOverrides } from "./fields.ts";

type YextAutoFieldProps<ValueType = any> = Omit<
  FieldProps<any, ValueType>,
  "field"
> & {
  field: YextFieldDefinition<ValueType>;
  value: ValueType;
};

type YextOverrideType = keyof typeof YextPuckFieldOverrides;

const isYextOverrideType = (type: string): type is YextOverrideType =>
  type in YextPuckFieldOverrides;

const normalizeField = (
  field: YextFieldDefinition<any>
): YextFieldDefinition<any> => {
  if (isYextOverrideType(field.type)) {
    // Nested Puck override field types render correctly, but Puck still creates
    // a default child component for non-core field types, which produces React
    // warnings. Wrapping nested overrides as `custom` avoids that path.
    const FieldOverride = YextPuckFieldOverrides[field.type];

    return {
      type: "custom",
      visible: field.visible,
      render: ({ field: _, ...props }) => (
        <FieldOverride field={field} {...(props as any)} />
      ),
    };
  }

  if (field.type === "array" && "arrayFields" in field) {
    return {
      ...field,
      arrayFields: Object.fromEntries(
        Object.entries(field.arrayFields).map(([key, value]) => [
          key,
          normalizeField(value as YextFieldDefinition<any>),
        ])
      ),
    };
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: Object.fromEntries(
        Object.entries(field.objectFields).map(([key, value]) => [
          key,
          normalizeField(value as YextFieldDefinition<any>),
        ])
      ),
    };
  }

  return field;
};

export const YextAutoField = <ValueType,>({
  field,
  ...props
}: YextAutoFieldProps<ValueType>) => {
  if (isYextOverrideType(field.type)) {
    const FieldOverride = YextPuckFieldOverrides[field.type];

    return <FieldOverride field={field} {...(props as any)} />;
  }

  const normalizedField = React.useMemo(() => normalizeField(field), [field]);

  return <AutoField field={normalizedField} {...(props as any)} />;
};
