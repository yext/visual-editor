import type {
  ArrayField,
  CustomField,
  ComponentConfig,
  DefaultComponentProps,
  Field,
  Fields,
  ObjectField,
} from "@puckeditor/core";
import {
  BasicSelectorField,
  BasicSelectorFieldOverride,
} from "./BasicSelectorField.tsx";
import { CodeField, CodeFieldOverride } from "./CodeField.tsx";
import {
  DateTimeSelectorField,
  DateTimeSelectorFieldOverride,
} from "./DateTimeSelectorField.tsx";
import {
  EntityFieldSelectorField,
  EntityFieldSelectorFieldOverride,
} from "./EntityFieldSelectorField.tsx";
import {
  FontSizeSelectorField,
  FontSizeSelectorFieldOverride,
} from "./FontSizeSelectorField.tsx";
import {
  CTASelectorField,
  CTASelectorFieldOverride,
} from "./CTASelectorField.tsx";
import {
  MultiSelectorField,
  MultiSelectorFieldOverride,
} from "./MultiSelectorField.tsx";
import {
  OptionalNumberField,
  OptionalNumberFieldOverride,
} from "./OptionalNumberField.tsx";
import { ImageField, ImageFieldOverride } from "./ImageField.tsx";
import {
  ItemSourceField,
  ItemSourceFieldOverride,
} from "./ItemSourceField.tsx";
import {
  StyledButtonField,
  StyledButtonFieldOverride,
} from "./styledFields/StyledButtonField.tsx";
import {
  StyledImageField,
  StyledImageFieldOverride,
} from "./styledFields/StyledImageField.tsx";
import {
  StyledLinkField,
  StyledLinkFieldOverride,
} from "./styledFields/StyledLinkField.tsx";
import {
  StyledPageSectionField,
  StyledPageSectionFieldOverride,
} from "./styledFields/StyledPageSection.tsx";
import {
  StyledTextField,
  StyledTextFieldOverride,
} from "./styledFields/StyledTextField.tsx";
import {
  TranslatableStringField,
  TranslatableStringFieldOverride,
} from "./TranslatableStringField.tsx";
import { VideoField, VideoFieldOverride } from "./VideoField.tsx";

export type YextPuckFields = {
  basicSelector: BasicSelectorField;
  ctaSelector: CTASelectorField;
  code: CodeField;
  dateTimeSelector: DateTimeSelectorField;
  entityField: EntityFieldSelectorField;
  multiSelector: MultiSelectorField;
  fontSizeSelector: FontSizeSelectorField;
  image: ImageField;
  itemSource: ItemSourceField;
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
> = Omit<
  ComponentConfig<{
    props: Props;
    fields: YextPuckFields;
  }>,
  "fields" | "resolveFields"
> & {
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

// For things like resolveFields, Puck does not currently let you override the return type
// so we need this function to satisfy the typing.
export const toPuckFields = <
  Props extends DefaultComponentProps = DefaultComponentProps,
>(
  fields: YextFields<Props> | YextFieldMap<Props>
): Fields<Props> => fields as unknown as Fields<Props>;

export const YextPuckFieldOverrides = {
  basicSelector: BasicSelectorFieldOverride,
  ctaSelector: CTASelectorFieldOverride,
  code: CodeFieldOverride,
  dateTimeSelector: DateTimeSelectorFieldOverride,
  entityField: EntityFieldSelectorFieldOverride,
  multiSelector: MultiSelectorFieldOverride,
  fontSizeSelector: FontSizeSelectorFieldOverride,
  image: ImageFieldOverride,
  itemSource: ItemSourceFieldOverride,
  optionalNumber: OptionalNumberFieldOverride,
  styledButton: StyledButtonFieldOverride,
  styledImage: StyledImageFieldOverride,
  styledLink: StyledLinkFieldOverride,
  styledPageSection: StyledPageSectionFieldOverride,
  styledText: StyledTextFieldOverride,
  translatableString: TranslatableStringFieldOverride,
  video: VideoFieldOverride,
};
