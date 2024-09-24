import React from "react";
import {
  AutoField,
  FieldLabel,
  ComponentData,
  DefaultComponentProps,
} from "@measured/puck";
import { Unlock } from "lucide-react";
import { RenderProps } from "../utils/renderEntityFields.tsx";
import {
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../utils/getFilteredEntityFields.ts";

export type EntityFieldType = {
  name: string;
  value: string;
};
export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    useDocument: (...args: any[]) => any;
    label: string;
    filter: RenderEntityFieldFilter<T>;
  };
type ResolveDataForEntityFieldProps<T extends DefaultComponentProps> = Omit<
  ComponentData<T, string>,
  "type"
>;
type ResolveDataForEntityFieldChanged<T extends DefaultComponentProps> = {
  changed: Partial<Record<keyof T, boolean>>;
  lastData: Omit<ComponentData<T, string>, "type"> | null;
};

/**
 * Returns the constant value if it exists, otherwise returns the selected field's value.
 */
export const resolveProp = <T,>(document: any, entityField: string): T => {
  return document[entityField] || (entityField as T);
};

/**
 * Allows the user to select an entity field from the document or set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>>(
  props: RenderYextEntityFieldSelectorProps<T>
) => {
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange, readOnly }: RenderProps) => {
      const filteredEntityFields = getFilteredEntityFields(props.filter);
      const document = props.useDocument();

      return (
        <>
          <FieldLabel
            label={field.label || "Label is undefined"}
            //@ts-expect-error ts(2367)
            readOnly={readOnly === "name"}
          >
            <AutoField
              field={{
                type: "select",
                options: [
                  { value: "", label: "Select a Content field" },
                  ...filteredEntityFields.map((entityFieldNameToSchema) => {
                    return {
                      label: entityFieldNameToSchema.name,
                      value: entityFieldNameToSchema.name,
                    };
                  }),
                ],
              }}
              onChange={(value) => {
                onChange({
                  name: value as unknown as string, // hack because the option value is a string so it comes back as a string even though TS thinks it's an object
                  value: resolveProp(document, value as unknown as string),
                });
              }}
              value={value?.name}
              //@ts-expect-error ts(2367)
              readOnly={readOnly === "name"}
            />
            {value?.name && (
              <button
                type="button"
                className={"entityField"}
                onClick={() => {
                  onChange({ name: "", value: value?.value });
                }}
                //@ts-expect-error ts(2367)
                disabled={readOnly === "name"}
              >
                <span className="entityField-unlock-icon">
                  <Unlock size={16} />
                </span>
                <span>Use a constant value</span>
              </button>
            )}
          </FieldLabel>
          <FieldLabel
            //@ts-expect-error ts(2367)
            label={readOnly === "value" ? "Value" : "Constant Value"}
            //@ts-expect-error ts(2367)
            readOnly={readOnly === "value"}
            className="entityField-value"
          >
            <AutoField
              //@ts-expect-error ts(2367)
              readOnly={readOnly === "value"}
              onChange={(value) =>
                onChange({
                  name: "",
                  value: value,
                })
              }
              value={value?.value}
              field={{
                type: "text",
              }}
            />
          </FieldLabel>
        </>
      );
    },
  };
};

/**
 * Locks or unlocks the constant value field on prop value update.
 */
export const resolveDataForEntityField = <T extends DefaultComponentProps>(
  fieldName: keyof T,
  { props }: ResolveDataForEntityFieldProps<T>,
  { changed }: ResolveDataForEntityFieldChanged<T>
) => {
  if (props && props[fieldName] && !props[fieldName].entityField?.name) {
    return {
      props,
      readOnly: {
        [fieldName.toString() + ".entityField"]: false,
      },
    };
  }

  if (!changed[fieldName]) {
    return { props };
  }

  return {
    props,
    readOnly: {
      [fieldName.toString() + ".entityField"]: "value",
    },
  };
};
