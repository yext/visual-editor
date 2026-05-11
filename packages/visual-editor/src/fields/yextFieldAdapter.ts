import type { Field } from "@puckeditor/core";
import type { YextFieldDefinition, YextPuckField } from "./fields.ts";
import { isYextOverrideType } from "./fieldOverrides.ts";

type YextFieldRender = (field: YextPuckField) => Field<any>;

export const adaptYextField = (
  field: YextFieldDefinition<any>,
  renderYextField: YextFieldRender
): Field<any> => {
  if (isYextOverrideType(field.type)) {
    return renderYextField(field as YextPuckField);
  }

  if (field.type === "object" && "objectFields" in field) {
    return {
      ...field,
      objectFields: adaptYextFieldMap(field.objectFields, renderYextField),
    } as Field<any>;
  }

  if (field.type === "array" && "arrayFields" in field) {
    return {
      ...field,
      arrayFields: adaptYextFieldMap(field.arrayFields, renderYextField),
    } as Field<any>;
  }

  return field as Field<any>;
};

export const adaptYextFieldMap = (
  fields: Record<string, YextFieldDefinition<any>>,
  renderYextField: YextFieldRender
): Record<string, Field<any>> =>
  Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [
      key,
      adaptYextField(field, renderYextField),
    ])
  );
