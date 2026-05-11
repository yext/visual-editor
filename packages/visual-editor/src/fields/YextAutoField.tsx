import React from "react";
import { AutoField, type FieldProps } from "@puckeditor/core";
import type { YextFieldDefinition } from "./fields.ts";
import {
  isYextOverrideType,
  YextPuckFieldOverrides,
} from "./fieldOverrides.ts";
import { adaptYextField } from "./yextFieldAdapter.ts";

type YextAutoFieldProps<ValueType = any> = Omit<
  FieldProps<any, ValueType>,
  "field"
> & {
  field: YextFieldDefinition<ValueType>;
  value: ValueType;
};

const normalizeField = (
  field: YextFieldDefinition<any>
): YextFieldDefinition<any> => {
  return adaptYextField(field, (yextField) => {
    // Nested Puck override field types render correctly, but Puck still creates
    // a default child component for non-core field types, which produces React
    // warnings. Wrapping nested overrides as `custom` avoids that path.
    const FieldOverride = YextPuckFieldOverrides[yextField.type];

    return {
      ...yextField,
      type: "custom",
      render: ({ field: _, ...props }) => (
        <FieldOverride field={yextField} {...(props as any)} />
      ),
    };
  });
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
