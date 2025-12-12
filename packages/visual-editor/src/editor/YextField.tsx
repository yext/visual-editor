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
  DynamicOption,
  DynamicOptionsSelector,
  DynamicOptionsSingleSelector,
  DynamicOptionValueTypes,
  OptionalNumberFieldProps,
  OptionalNumberField,
  CodeFieldProps,
  CodeField,
  getMaxWidthOptions,
  msg,
  TranslatableStringField,
  DynamicOptionsSelectorType,
  DynamicOptionsSingleSelectorType,
} from "@yext/visual-editor";
import {
  RenderYextEntityFieldSelectorProps,
  YextEntityField,
  YextEntityFieldSelector,
} from "./YextEntityFieldSelector.tsx";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { MsgString } from "../utils/i18n/platform.ts";
import { IMAGE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Image.tsx";
import { VIDEO_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Video.tsx";
import { ComboboxOption } from "../internal/puck/ui/Combobox.tsx";
import {
  getSchemaForYextEntityField,
  getSchemaForSelectField,
  textFieldSchema,
  numberFieldSchema,
  translatableStringFieldSchema,
  FieldAiConfig,
} from "./aiSchemas.ts";

/** Field option type for select/radio fields */
export type FieldOption = {
  label: string;
  value: string | number | boolean | undefined | null | object;
};

/** Array of field options for select/radio fields */
export type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

type RadioOptions =
  | "PHONE_OPTIONS"
  | "ALIGNMENT"
  | "BODY_VARIANT"
  | "JUSTIFY_CONTENT"
  | "CTA_VARIANT";

type SelectOptions = keyof Omit<typeof ThemeOptions, RadioOptions>;

type ThemeOptionsKey = keyof typeof ThemeOptions;

/** Type guard to check if a value is a valid ThemeOptions key */
function isThemeOptionsKey(value: unknown): value is ThemeOptionsKey {
  return typeof value === "string" && value in ThemeOptions;
}

type YextBaseField = {
  type: string;
  visible?: boolean;
  ai?: FieldAiConfig;
};

// YextArrayField has same functionality as Puck's ArrayField
// Note: Uses `any` for Props due to complex generic constraints with Puck's Field types
type YextArrayField<
  Props extends { [key: string]: unknown }[] = { [key: string]: unknown }[],
> = YextBaseField & Omit<ArrayField<Props>, keyof BaseField>;

// YextNumberField has same functionality as Puck's NumberField
type YextNumberField = YextBaseField & Omit<NumberField, keyof BaseField>;

// YextObjectField has same functionality as Puck's ObjectField
// Note: Uses `any` for Props due to complex generic constraints with Puck's Field types
type YextObjectField<
  Props extends { [key: string]: unknown } = { [key: string]: unknown },
> = YextBaseField & Omit<ObjectField<Props>, keyof BaseField>;

// YextRadioField accepts normal FieldOptions or specific ThemeConfig options.
type YextRadioField = YextBaseField & {
  type: "radio";
  options: FieldOptions | RadioOptions;
};

// YextSelectField accepts normal FieldOptions or specific ThemeConfig options.
// If hasSearch is true, uses the BasicSelector rather than Puck's SelectField.
type YextSelectField = YextBaseField & {
  type: "select";
  hasSearch?: boolean;
  options: FieldOptions | SelectOptions;
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

type YextTranslatableStringField = YextBaseField & {
  type: "translatableString";
  filter?: RenderEntityFieldFilter<Record<string, unknown>>;
  showApplyAllOption?: boolean;
};

type YextImageField = YextBaseField & {
  type: "image";
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

type YextDynamicSingleSelectField<T extends DynamicOptionValueTypes> =
  YextBaseField & {
    type: "dynamicSingleSelect";
    getOptions: () => DynamicOption<T>[];
    dropdownLabel: string;
    placeholderOptionLabel?: string;
  };

// YextEntitySelectorField has same functionality as YextEntityFieldSelector
// Note: Uses Record<string, unknown> as default for T to maintain type flexibility
type YextEntitySelectorField<
  T extends Record<string, unknown> = Record<string, unknown>,
> = YextBaseField &
  Omit<RenderYextEntityFieldSelectorProps<T>, "label"> & {
    type: "entityField";
  };

// Note: This union type uses conditional types with `any` fallbacks to maintain
// compatibility with existing call sites that rely on flexible type inference.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YextFieldConfig<Props = any> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | YextArrayField<Props extends Record<string, any>[] ? Props : any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | YextObjectField<Props extends Record<string, any> ? Props : any>
  | YextNumberField
  | YextTextField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | YextEntitySelectorField<Props extends Record<string, any> ? Props : any>
  | YextSelectField
  | YextRadioField
  | YextOptionalNumberField
  | YextCodeField
  | YextMaxWidthField
  | YextTranslatableStringField
  | YextImageField
  | YextVideoField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | YextDynamicSelectField<Props extends DynamicOptionValueTypes ? Props : any>
  | YextDynamicSingleSelectField<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Props extends DynamicOptionValueTypes ? Props : any
    >;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function YextField<T = any>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
): Field<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function YextField<
  T extends DynamicOptionsSingleSelectorType<U>,
  U extends DynamicOptionValueTypes,
>(fieldName: MsgString, config: YextDynamicSingleSelectField<U>): Field<T>;

/**
 * Creates a Puck field configuration with Yext-specific enhancements.
 *
 * @param fieldName - The label for the field
 * @param config - Configuration object that determines the field type and options
 * @returns A Puck Field configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function YextField<T, U>(
  fieldName: MsgString,
  config: YextFieldConfig<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // use YextEntityFieldSelector
  if (config.type === "entityField") {
    // Get schema for the entity field based on filter types
    const schema = getSchemaForYextEntityField(config.filter);

    // Build the field with AI config
    const field = YextEntityFieldSelector<
      T extends Record<string, any> ? T : any,
      U
    >({
      label: fieldName,
      filter: config.filter,
      disableConstantValueToggle: config.disableConstantValueToggle,
      disallowTranslation: config.disallowTranslation,
      typeSelectorConfig: config.typeSelectorConfig,
    });

    // Merge AI config if schema exists or if user provided AI config
    if (schema || config.ai) {
      return {
        ...field,
        ai: {
          ...(schema ? { schema } : {}),
          ...config.ai,
        },
      };
    }

    return field;
  }

  if (config.type === "optionalNumber") {
    const field = OptionalNumberField({
      fieldLabel: fieldName,
      hideNumberFieldRadioLabel: config.hideNumberFieldRadioLabel,
      showNumberFieldRadioLabel: config.showNumberFieldRadioLabel,
      defaultCustomValue: config.defaultCustomValue,
    });
    // Default schema for optional number
    const defaultSchema = numberFieldSchema;
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "select" && config.options === "BACKGROUND_COLOR") {
    const options = ThemeOptions.BACKGROUND_COLOR.flatMap(
      (group) => group.options
    );
    const field = BasicSelector({
      label: fieldName,
      optionGroups: ThemeOptions.BACKGROUND_COLOR,
      disableSearch: true,
    });
    // Default schema from options
    const defaultSchema = getSchemaForSelectField(options as FieldOptions);
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  // use BasicSelector functionality
  if (config.type === "select" && config.hasSearch) {
    const options = isThemeOptionsKey(config.options)
      ? ThemeOptions[config.options]
      : config.options;
    const field = BasicSelector({
      label: fieldName,
      options: options as ComboboxOption[],
    });
    // Default schema from options
    const defaultSchema = getSchemaForSelectField(options as FieldOptions);
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (
    (config.type === "select" || config.type === "radio") &&
    isThemeOptionsKey(config.options)
  ) {
    const options = ThemeOptions[config.options] as FieldOptions;
    const field = {
      label: fieldName,
      visible: config.visible,
      type: config.type,
      options,
    };
    // Default schema from options
    const defaultSchema = getSchemaForSelectField(options);
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "text") {
    const field = {
      label: fieldName,
      visible: config.visible,
      type: config.isMultiline ? "textarea" : "text",
    };
    // Default schema for text
    const defaultSchema = textFieldSchema;
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "code") {
    const field = CodeField({
      fieldLabel: fieldName,
      codeLanguage: config.codeLanguage,
    });
    // Default schema for code (string)
    const defaultSchema = textFieldSchema;
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "maxWidth") {
    const maxWidthOptions = getMaxWidthOptions();
    const field = BasicSelector({
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
    // Default schema from options
    const defaultSchema = getSchemaForSelectField(maxWidthOptions);
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "translatableString") {
    const field = TranslatableStringField(
      fieldName,
      config.filter,
      config.showApplyAllOption
    );
    // Default schema for translatable string
    const defaultSchema = translatableStringFieldSchema;
    return {
      ...field,
      ai: { schema: defaultSchema, ...config.ai },
    };
  }

  if (config.type === "image") {
    const field = {
      ...IMAGE_CONSTANT_CONFIG,
      label: fieldName,
    };
    // Image fields typically shouldn't be AI generated, exclude by default
    return {
      ...field,
      ai: { exclude: true, ...config.ai },
    };
  }

  if (config.type === "video") {
    const field = {
      ...VIDEO_CONSTANT_CONFIG,
      label: fieldName,
    };
    // Video fields typically shouldn't be AI generated, exclude by default
    return {
      ...field,
      ai: { exclude: true, ...config.ai },
    };
  }

  if (config.type === "dynamicSelect") {
    const field = DynamicOptionsSelector({
      label: fieldName,
      dropdownLabel: config.dropdownLabel,
      getOptions: config.getOptions,
      placeholderOptionLabel: config.placeholderOptionLabel,
    });
    // Dynamic options - user should provide schema if needed
    return config.ai ? { ...field, ai: config.ai } : field;
  }

  if (config.type === "dynamicSingleSelect") {
    const field = DynamicOptionsSingleSelector({
      label: fieldName,
      dropdownLabel: config.dropdownLabel,
      getOptions: config.getOptions,
      placeholderOptionLabel: config.placeholderOptionLabel,
    });
    // Dynamic options - user should provide schema if needed
    return config.ai ? { ...field, ai: config.ai } : field;
  }

  const field = {
    label: fieldName,
    ...config,
  };
  return (config.ai ? { ...field, ai: config.ai } : field) as Field<T>;
}
