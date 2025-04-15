import {
  ArrayField,
  BaseField,
  Field,
  NumberField,
  ObjectField,
} from "@measured/puck";
import {
  YextEntityFieldSelector,
  ThemeOptions,
  BasicSelector,
} from "@yext/visual-editor";
import { YextEntityField } from "./YextEntityFieldSelector.tsx";

/** Copied from Puck, do not change */
export type FieldOption = {
  label: string;
  value: string | number | boolean;
};

/** Copied from Puck, do not change */
export type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

type radioOptions =
  | "PHONE_OPTIONS"
  | "ALIGNMENT"
  | "BODY_VARIANT"
  | "JUSTIFY_CONTENT"
  | "CTA_VARIANT";

type selectOptions = keyof Omit<typeof ThemeOptions, radioOptions>;

type YextBaseField = {
  type: string;
};

type YextArrayField = YextBaseField & Omit<ArrayField, keyof BaseField>;

type YextNumberField = YextBaseField & Omit<NumberField, keyof BaseField>;

type YextObjectField = YextBaseField & Omit<ObjectField, keyof BaseField>;

type YextRadioField = YextBaseField & {
  type: "radio";
  options: FieldOptions | radioOptions;
};

type YextSelectField = YextBaseField & {
  type: "select";
  hasSearch?: boolean;
  options: FieldOptions | selectOptions;
};

type YextTextField = YextBaseField & {
  type: "text";
  isMultiline?: boolean;
};

type YextEntitySelectorField = YextBaseField & {
  type: "entity";
  filter: any;
};

type YextFieldConfig =
  | YextArrayField
  | YextNumberField
  | YextTextField
  | YextEntitySelectorField
  | YextSelectField
  | YextRadioField
  | YextObjectField;

export function YextField<U>(
  fieldName: string,
  config: { type: "entity"; filter: any }
): Field<YextEntityField<U>>;
export function YextField<T = any>(
  fieldName: string,
  config: YextFieldConfig
): Field<T>;

export function YextField<T, U>(
  fieldName: string,
  config: YextFieldConfig
): Field<any> {
  if (config.type === "entity") {
    return YextEntityFieldSelector<any, U>({
      label: fieldName,
      filter: config.filter,
    });
  }

  if (config.type === "select" && config.hasSearch) {
    const options =
      typeof config.options === "string"
        ? ThemeOptions[config.options]
        : config.options;
    return BasicSelector(fieldName, options as any);
  }

  if (
    (config.type === "select" || config.type === "radio") &&
    typeof config.options === "string"
  ) {
    return {
      label: fieldName,
      type: config.type,
      options: ThemeOptions[config.options] as FieldOptions,
    };
  }

  if (config.type === "text") {
    return {
      label: fieldName,
      type: config.isMultiline ? "textarea" : "text",
    };
  }

  return {
    label: fieldName,
    ...config,
  } as Field<T>;
}
