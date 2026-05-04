import {
  ArrayField,
  BaseField,
  type CustomField,
  Field,
  NumberField,
  ObjectField,
} from "@puckeditor/core";
import { type EntityFieldSelectorField } from "../fields/EntityFieldSelectorField.tsx";
import { MsgString } from "../utils/i18n/platform.ts";
import type { YextFieldMap, YextPuckFields } from "../fields/fields.ts";
import {
  type RenderYextSubfieldSelectorProps,
  YextSubfieldSelector,
} from "./YextSubfieldSelector.tsx";
import { type YextEntityField } from "./yextEntityFieldUtils.ts";

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

type YextEntitySelectorField<
  T extends Record<string, any> = Record<string, any>,
> = YextBaseField &
  Omit<EntityFieldSelectorField<T>, keyof BaseField | "label"> & {
    type: "entityField";
  };

type YextSubfieldSelectorField<
  T extends Record<string, any> = Record<string, any>,
> = YextBaseField &
  Omit<RenderYextSubfieldSelectorProps<T>, "label"> & {
    type: "subfieldSelector";
  };

type YextFieldConfig<Props = any> =
  | YextArrayFieldConfig<Props extends Record<string, any>[] ? Props : any>
  | YextObjectFieldConfig<Props extends Record<string, any> ? Props : any>
  | YextNumberField
  | YextEntitySelectorField<Props extends Record<string, any> ? Props : any>
  | YextSubfieldSelectorField<Props extends Record<string, any> ? Props : any>
  | YextPuckFields[Exclude<
      keyof YextPuckFields,
      | "basicSelector"
      | "code"
      | "entityField"
      | "image"
      | "multiSelector"
      | "optionalNumber"
      | "video"
      | "translatableString"
    >];

export function YextField<T = any>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): Field<T>;

export function YextField<T extends Record<string, any>[]>(
  fieldName: MsgString,
  config: YextArrayFieldConfig<T>
): YextArrayField<T>;

export function YextField<T extends Record<string, any>>(
  fieldName: MsgString,
  config: YextObjectFieldConfig<T>
): YextObjectField<T>;

export function YextField<T extends Record<string, any>, U = any>(
  fieldName: MsgString,
  config: YextEntitySelectorField<T>
): Field<YextEntityField<U>>;

export function YextField<T extends Record<string, any>, U = any>(
  fieldName: MsgString,
  config: YextSubfieldSelectorField<T>
): Field<YextEntityField<U>>;

export function YextField<T, U>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): any {
  if (config.type === "subfieldSelector") {
    return YextSubfieldSelector<T extends Record<string, any> ? T : any, U>({
      label: fieldName,
      sourceField: config.sourceField,
      sourceFieldPath: config.sourceFieldPath,
      filter: config.filter,
      constantValueFilter: config.constantValueFilter,
      disableConstantValueToggle: config.disableConstantValueToggle,
      disallowTranslation: config.disallowTranslation,
    });
  }

  return {
    label: fieldName,
    ...config,
  } as Field<T>;
}
