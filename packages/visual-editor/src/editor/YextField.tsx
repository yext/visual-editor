import {
  ArrayField,
  BaseField,
  Field,
  NumberField,
  ObjectField,
} from "@measured/puck";
import {
  ThemeOptions,
  BasicSelector,
  OptionalNumberFieldProps,
  OptionalNumberField,
  CodeFieldProps,
  CodeField,
  getMaxWidthOptions,
  msg,
} from "@yext/visual-editor";
import {
  RenderYextEntityFieldSelectorProps,
  YextEntityField,
  YextEntityFieldSelector,
} from "./YextEntityFieldSelector.tsx";

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
  visible?: boolean;
};

// YextArrayField has same functionality as Puck's ArrayField
type YextArrayField<
  Props extends { [key: string]: any } = { [key: string]: any },
> = YextBaseField & Omit<ArrayField<Props>, keyof BaseField>;

// YextNumberField has same functionality as Puck's NumberField
type YextNumberField = YextBaseField & Omit<NumberField, keyof BaseField>;

// YextObjectField has same functionality as Puck's ObjectField
type YextObjectField<
  Props extends { [key: string]: any } = { [key: string]: any },
> = YextBaseField & Omit<ObjectField<Props>, keyof BaseField>;

// YextRadioField accepts normal FieldOptions or specific ThemeConfig options.
type YextRadioField = YextBaseField & {
  type: "radio";
  options: FieldOptions | radioOptions;
};

// YextSelectField accepts normal FieldOptions or specific ThemeConfig options.
// If hasSearch is true, uses the BasicSelector rather than Puck's SelectField.
type YextSelectField = YextBaseField & {
  type: "select";
  hasSearch?: boolean;
  options: FieldOptions | selectOptions;
};

// YextTextField has same functionality as Puck's TextField
// If isMultiline is true, uses Puck's TextAreaField
type YextTextField = YextBaseField & {
  type: "text";
  isMultiline?: boolean;
  disallowTranslation?: boolean;
};

// YextOptionalNumberField has same functionality as OptionalNumberField
type YextOptionalNumberField = YextBaseField &
  Omit<OptionalNumberFieldProps, "fieldLabel"> & {
    type: "optionalNumber";
  };

type YextCodeField = YextBaseField &
  Omit<CodeFieldProps, "fieldLabel"> & {
    type: "code";
  };

type YextMaxWidthField = YextBaseField & {
  type: "maxWidth";
};

// YextEntitySelectorField has same functionality as YextEntityFieldSelector
type YextEntitySelectorField<
  T extends Record<string, any> = Record<string, any>,
> = YextBaseField &
  Omit<RenderYextEntityFieldSelectorProps<T>, "label"> & {
    type: "entityField";
  };

type YextFieldConfig<Props = any> =
  | YextArrayField<Props extends Record<string, any> ? Props : any>
  | YextObjectField<Props extends Record<string, any> ? Props : any>
  | YextNumberField
  | YextTextField
  | YextEntitySelectorField<Props extends Record<string, any> ? Props : any>
  | YextSelectField
  | YextRadioField
  | YextOptionalNumberField
  | YextCodeField
  | YextMaxWidthField;

export function YextField<T = any>(
  fieldName: string,
  config: YextFieldConfig<T>
): Field<T>;

export function YextField<T extends Record<string, any>, U = any>(
  fieldName: string,
  config: YextEntitySelectorField<T>
): Field<YextEntityField<U>>;

export function YextField<T, U>(
  fieldName: string,
  config: YextFieldConfig<T>
): Field<any> {
  // use YextEntityFieldSelector
  if (config.type === "entityField") {
    return YextEntityFieldSelector<T extends Record<string, any> ? T : any, U>({
      label: fieldName,
      filter: config.filter,
      disableConstantValueToggle: config.disableConstantValueToggle,
      disallowTranslation: config.disallowTranslation,
    });
  }

  if (config.type === "optionalNumber") {
    return OptionalNumberField({
      fieldLabel: fieldName,
      hideNumberFieldRadioLabel: config.hideNumberFieldRadioLabel,
      showNumberFieldRadioLabel: config.showNumberFieldRadioLabel,
      defaultCustomValue: config.defaultCustomValue,
    });
  }

  if (config.type === "select" && config.options === "BACKGROUND_COLOR") {
    const options = ThemeOptions[config.options];
    return BasicSelector({
      label: fieldName,
      optionGroups: options,
      disableSearch: true,
    });
  }

  // use BasicSelector functionality
  if (config.type === "select" && config.hasSearch) {
    const options =
      typeof config.options === "string"
        ? ThemeOptions[config.options]
        : config.options;
    return BasicSelector({ label: fieldName, options: options as any });
  }

  if (
    (config.type === "select" || config.type === "radio") &&
    typeof config.options === "string"
  ) {
    return {
      label: fieldName,
      visible: config.visible,
      type: config.type,
      options: ThemeOptions[config.options] as FieldOptions,
    };
  }

  if (config.type === "text") {
    return {
      label: fieldName,
      visible: config.visible,
      type: config.isMultiline ? "textarea" : "text",
    };
  }

  if (config.type === "code") {
    return CodeField({
      fieldLabel: fieldName,
      codeLanguage: config.codeLanguage,
    });
  }

  if (config.type === "maxWidth") {
    const maxWidthOptions = getMaxWidthOptions();
    return BasicSelector({
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
    });
  }

  return {
    label: fieldName,
    ...config,
  } as Field<T>;
}
