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
import { getMaxWidthOptions } from "./MaxWidthSelector.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { TranslatableStringField } from "./TranslatableStringField.tsx";
import {
  RenderYextEntityFieldSelectorProps,
  YextEntityField,
  YextEntityFieldSelector,
} from "./YextEntityFieldSelector.tsx";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { MsgString } from "../utils/i18n/platform.ts";
import { VIDEO_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Video.tsx";
import type { YextPuckFields } from "../fields/fields.ts";

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

type YextFieldMap<Props extends Record<string, any>> = {
  [PropName in keyof Props as PropName extends "editMode"
    ? never
    : PropName]: YextFieldDefinition<Props[PropName]>;
};

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

type YextMaxWidthField = YextBaseField & {
  type: "maxWidth";
};

type YextTranslatableStringField = YextBaseField & {
  type: "translatableString";
  filter?: RenderEntityFieldFilter<any>;
  showApplyAllOption?: boolean;
};

type YextVideoField = YextBaseField & {
  type: "video";
};

type YextDynamicSelectField<T extends DynamicOptionValueTypes> =
  YextBaseField & {
    type: "dynamicSelect";
    dropdownLabel: string;
    getOptions: () => DynamicOption<T>[];
    placeholderOptionLabel?: string;
  };

// YextEntitySelectorField has same functionality as YextEntityFieldSelector
type YextEntitySelectorField<
  T extends Record<string, any> = Record<string, any>,
> = YextBaseField &
  Omit<RenderYextEntityFieldSelectorProps<T>, "label"> & {
    type: "entityField";
  };

type YextFieldConfig<Props = any> =
  | YextArrayFieldConfig<Props extends Record<string, any>[] ? Props : any>
  | YextObjectFieldConfig<Props extends Record<string, any> ? Props : any>
  | YextNumberField
  | YextEntitySelectorField<Props extends Record<string, any> ? Props : any>
  | YextMaxWidthField
  | YextTranslatableStringField
  | YextVideoField
  | YextDynamicSelectField<Props extends DynamicOptionValueTypes ? Props : any>
  | YextPuckFields[Exclude<
      keyof YextPuckFields,
      "basicSelector" | "image" | "optionalNumber"
    >];

export function YextField<T = any>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): Field<T>;

export function YextField<T extends Record<string, any>, U = any>(
  fieldName: MsgString,
  config: YextEntitySelectorField<T>
): Field<YextEntityField<U>>;

export function YextField<
  T extends DynamicOptionsSelectorType<U>,
  U extends DynamicOptionValueTypes,
>(
  fieldName: MsgString,
  config: YextDynamicSelectField<U>
): Field<T | undefined>;

export function YextField<T, U>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): any {
  // use YextEntityFieldSelector
  if (config.type === "entityField") {
    return YextEntityFieldSelector<T extends Record<string, any> ? T : any, U>({
      label: fieldName,
      filter: config.filter,
      disableConstantValueToggle: config.disableConstantValueToggle,
      disallowTranslation: config.disallowTranslation,
    });
  }

  if (config.type === "code") {
    return {
      type: "code",
      label: fieldName,
      visible: config.visible,
      codeLanguage: config.codeLanguage,
    };
  }

  if (config.type === "maxWidth") {
    const maxWidthOptions = getMaxWidthOptions();
    return {
      type: "basicSelector",
      label: fieldName,
      disableSearch: true,
      optionGroups: [
        {
          description: msg(
            "maxWidthTip",
            "For optimal content alignment, we recommend setting the header and footer width to match or exceed the page content grid."
          ),
          options: maxWidthOptions,
        },
      ],
    };
  }

  if (config.type === "translatableString") {
    return TranslatableStringField(
      fieldName,
      config.filter,
      config.showApplyAllOption
    );
  }

  if (config.type === "video") {
    return {
      ...VIDEO_CONSTANT_CONFIG,
      label: fieldName,
    };
  }

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
