import {
  ArrayField,
  BaseField,
  type CustomField,
  Field,
  NumberField,
  ObjectField,
} from "@puckeditor/core";
import {
  DynamicOption,
  DynamicOptionsSelector,
  DynamicOptionValueTypes,
  DynamicOptionsSelectorType,
} from "./DynamicOptionsSelector.tsx";
import { MsgString } from "../utils/i18n/platform.ts";
import type { YextFieldMap, YextPuckFields } from "../fields/fields.ts";

/** Copied from Puck, do not change */
export type FieldOption = {
  label: string;
  value: string | number | boolean;
};

/** Copied from Puck, do not change */
export type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

type YextBaseField = {
  type: string;
  visible?: boolean;
};

export type YextPuckField = YextPuckFields[keyof YextPuckFields];

type YextArrayFieldConfig<
  Props extends { [key: string]: any }[] = { [key: string]: any }[],
> = YextBaseField &
  Omit<ArrayField<Props, YextPuckField>, keyof BaseField | "arrayFields"> & {
    arrayFields: YextFieldMap<Props[0]>;
  };

export type YextArrayField<
  Props extends { [key: string]: any }[] = { [key: string]: any }[],
> = Omit<ArrayField<Props, YextPuckField>, "arrayFields"> & {
  arrayFields: YextFieldMap<Props[0]>;
};

// YextNumberField has same functionality as Puck's NumberField
type YextNumberField = YextBaseField & Omit<NumberField, keyof BaseField>;

type YextObjectFieldConfig<
  Props extends { [key: string]: any } = { [key: string]: any },
> = YextBaseField &
  Omit<ObjectField<Props, YextPuckField>, keyof BaseField | "objectFields"> & {
    objectFields: YextFieldMap<Props>;
  };

export type YextObjectField<
  Props extends { [key: string]: any } = { [key: string]: any },
> = Omit<ObjectField<Props, YextPuckField>, "objectFields"> & {
  objectFields: YextFieldMap<Props>;
};

export type YextCustomFieldRenderProps<ValueType> = Parameters<
  CustomField<ValueType>["render"]
>[0];

export type YextFieldDefinition<ValueType = any> =
  | Field<ValueType, YextPuckField>
  | Field<NonNullable<ValueType>, YextPuckField>
  | YextPuckField
  | (ValueType extends Record<string, any>[]
      ? YextArrayField<ValueType>
      : never)
  | (ValueType extends Record<string, any>
      ? YextObjectField<ValueType>
      : never);

type YextDynamicSelectField<T extends DynamicOptionValueTypes> =
  YextBaseField & {
    type: "dynamicSelect";
    dropdownLabel: string;
    getOptions: () => DynamicOption<T>[];
    placeholderOptionLabel?: string;
  };

type YextFieldConfig<Props = any> =
  | YextArrayFieldConfig<Props extends Record<string, any>[] ? Props : any>
  | YextObjectFieldConfig<Props extends Record<string, any> ? Props : any>
  | YextNumberField
  | YextDynamicSelectField<Props extends DynamicOptionValueTypes ? Props : any>
  | YextPuckFields[Exclude<
      keyof YextPuckFields,
      | "basicSelector"
      | "code"
      | "entityField"
      | "image"
      | "optionalNumber"
      | "video"
      | "translatableString"
    >];

export function YextField<T = any>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): Field<T>;

export function YextField<
  T extends DynamicOptionsSelectorType<U>,
  U extends DynamicOptionValueTypes,
>(
  fieldName: MsgString,
  config: YextDynamicSelectField<U>
): Field<T | undefined>;

export function YextField<T>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): any {
  if (config.type === "dynamicSelect") {
    return DynamicOptionsSelector({
      label: fieldName,
      dropdownLabel: config.dropdownLabel,
      getOptions: config.getOptions,
      placeholderOptionLabel: config.placeholderOptionLabel,
    });
  }

  return {
    label: fieldName,
    ...config,
  } as Field<T>;
}
