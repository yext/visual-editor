import { createElement, type ReactElement } from "react";
import type {
  ArrayField,
  CustomField,
  ComponentConfig,
  DefaultComponentProps,
  Field,
  FieldProps,
  Fields,
  ObjectField,
} from "@puckeditor/core";
import type { BasicSelectorField } from "./BasicSelectorField.tsx";
import type { CodeField } from "./CodeField.tsx";
import type { DateTimeSelectorField } from "./DateTimeSelectorField.tsx";
import type { EntityFieldSelectorField } from "./EntityFieldSelectorField.tsx";
import type { FontSizeSelectorField } from "./FontSizeSelectorField.tsx";
import type { CTASelectorField } from "./CTASelectorField.tsx";
import type { MultiSelectorField } from "./MultiSelectorField.tsx";
import type { OptionalNumberField } from "./OptionalNumberField.tsx";
import type { ImageField } from "./ImageField.tsx";
import type { StyledButtonField } from "./styledFields/StyledButtonField.tsx";
import type { StyledImageField } from "./styledFields/StyledImageField.tsx";
import type { StyledLinkField } from "./styledFields/StyledLinkField.tsx";
import type { StyledPageSectionField } from "./styledFields/StyledPageSection.tsx";
import type { StyledTextField } from "./styledFields/StyledTextField.tsx";
import type { TranslatableStringField } from "./TranslatableStringField.tsx";
import type { VideoField } from "./VideoField.tsx";
import type {
  ComprehensiveCTAField,
  ComprehensiveCTAValue,
} from "./styledFields/ComprehensiveCTAField.tsx";
import type { EnhancedTranslatableCTA } from "../types/types.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { adaptYextFieldMap } from "./yextFieldAdapter.ts";

type LocalizedRenderValue<Value> = Value extends readonly (infer Item)[]
  ? LocalizedRenderValue<Item>[]
  : Value extends object
    ? "defaultValue" extends keyof Value
      ? LocalizedRenderValue<Value["defaultValue"]>
      : { [Key in keyof Value]: LocalizedRenderValue<Value[Key]> }
    : Value;

/** The presentation component consumes this data contract without resolving authored bindings. */
export type ResolvedComprehensiveCTAValue = Omit<
  ComprehensiveCTAValue,
  "data"
> & {
  data: Omit<
    ComprehensiveCTAValue["data"],
    "cta" | "buttonText" | "ariaLabel"
  > & {
    cta?: LocalizedRenderValue<EnhancedTranslatableCTA>;
    buttonText?: string;
    ariaLabel?: string;
  };
};

/** Repeated-item props retain their structure while authored value wrappers are resolved. */
type ResolvedRepeatedItem<Value> = Value extends {
  constantValue: infer Constant;
}
  ? LocalizedRenderValue<Constant> | undefined
  : Value extends ComprehensiveCTAValue
    ? ResolvedComprehensiveCTAValue
    : Value extends { selections: { value: infer Selection }[] }
      ? Exclude<Selection, undefined>[]
      : Value extends readonly (infer Item)[]
        ? ResolvedRepeatedItem<Item>[]
        : Value extends object
          ? { [Key in keyof Value]: ResolvedRepeatedItem<Value[Key]> }
          : Value;

type TransformedFieldValues<Value, Definition> = {
  translatableString: string;
  image: LocalizedRenderValue<Value>;
  video: LocalizedRenderValue<Value>;
  comprehensiveCTA: ResolvedComprehensiveCTAValue;
  multiSelector: Value extends { selections: { value: infer Selection }[] }
    ? Exclude<Selection, undefined>[]
    : never;
  optionalNumber: number | undefined;
  ctaSelector: LocalizedRenderValue<EnhancedTranslatableCTA> | undefined;
  entityField: Definition extends { repeated: object }
    ? Value extends { constantValue: infer Constant }
      ? LocalizedRenderValue<ResolvedRepeatedItem<Constant>>
      : never
    : Value extends { constantValue: infer Constant }
      ? LocalizedRenderValue<Constant> | undefined
      : never;
};

type TransformedFieldValue<Value, Definition> = Definition extends {
  transform: true;
  type: infer FieldType;
}
  ? FieldType extends keyof TransformedFieldValues<Value, Definition>
    ? TransformedFieldValues<Value, Definition>[FieldType]
    : Value
  : Definition extends { type: "object"; objectFields: infer Nested }
    ? YextTransformedProps<Value, Nested>
    : Definition extends { type: "array"; arrayFields: infer Nested }
      ? Value extends (infer Item)[]
        ? YextTransformedProps<Item, Nested>[]
        : Value
      : Value;

/** Derives render values from authored props and explicitly opted-in field definitions. */
export type YextTransformedProps<Props, Definitions> = {
  [Key in keyof Props]: Key extends keyof Definitions
    ? TransformedFieldValue<Props[Key], Definitions[Key]>
    : Props[Key];
};

export type YextPuckFields = {
  basicSelector: BasicSelectorField;
  ctaSelector: CTASelectorField;
  code: CodeField;
  comprehensiveCTA: ComprehensiveCTAField;
  dateTimeSelector: DateTimeSelectorField;
  entityField: EntityFieldSelectorField;
  multiSelector: MultiSelectorField;
  fontSizeSelector: FontSizeSelectorField;
  image: ImageField;
  optionalNumber: OptionalNumberField;
  styledButton: StyledButtonField;
  styledImage: StyledImageField;
  styledLink: StyledLinkField;
  styledPageSection: StyledPageSectionField;
  styledText: StyledTextField;
  translatableString: TranslatableStringField;
  video: VideoField;
};

export type YextPuckField = YextPuckFields[keyof YextPuckFields];

export type YextArrayField<
  Props extends { [key: string]: any }[] = { [key: string]: any }[],
> = Omit<ArrayField<Props, YextPuckField>, "arrayFields"> & {
  arrayFields: YextFieldMap<Props[0]>;
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

export type YextComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
  TransformFields = {},
> = Omit<
  ComponentConfig<{
    props: Props;
    fields: YextPuckFields;
  }>,
  "fields" | "resolveFields" | "render"
> & {
  render: ComponentConfig<{
    props: YextTransformedProps<Props, TransformFields>;
    fields: YextPuckFields;
  }>["render"];
  fields?: YextFields<Props>;
  resolveFields?: ComponentConfig<{
    props: Props;
    fields: YextPuckFields;
  }>["resolveFields"];
};

// TODO(SUMO-8378): Remove this and make YextFieldsInternal -> YextFields once Puck fixes their objectField typing
export type YextFields<
  T extends DefaultComponentProps = DefaultComponentProps,
> = YextFieldsInternal<T> & YextFieldMap<T>;

type YextFieldsInternal<
  T extends DefaultComponentProps = DefaultComponentProps,
> = Fields<T, any>;

export type YextFieldMap<
  T extends DefaultComponentProps = DefaultComponentProps,
> = {
  [PropName in keyof Omit<T, "editMode">]: YextFieldDefinition<T[PropName]>;
};

/** Keeps custom field components mounted when Puck updates field definitions. */
const renderYextField = ({
  field,
  ...props
}: FieldProps<CustomField<any>>): ReactElement =>
  createElement(YextAutoField, {
    ...props,
    field: (
      field as CustomField<any> & {
        yextField: YextFieldDefinition<any>;
      }
    ).yextField,
  });

/**
 * Converts Yext field definitions into a runtime `Fields` object that Puck can
 * render safely.
 *
 * Yext field types are registered as Puck overrides, but Puck still asks its
 * internal default field registry to render child fields inside native `object`
 * and `array` fields. Since field types like `basicSelector` do not exist in
 * that registry, this wraps each Yext-specific field as a Puck `custom` field
 * rendered by `YextAutoField`, including nested `objectFields` and
 * `arrayFields`. Normal Puck field types are left unchanged.
 */
export const toPuckFields = <
  Props extends DefaultComponentProps = DefaultComponentProps,
>(
  fields: Fields<Props, any>
): Fields<Props> =>
  adaptYextFieldMap(
    fields as Record<string, YextFieldDefinition<any>>,
    (yextField) => ({
      ...yextField,
      type: "custom",
      yextField,
      render: renderYextField,
    })
  ) as Fields<Props>;
