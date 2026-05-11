import { createElement } from "react";
import type {
  ArrayField,
  CustomField,
  ComponentConfig,
  DefaultComponentProps,
  Field,
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
import { YextAutoField } from "./YextAutoField.tsx";
import { adaptYextFieldMap } from "./yextFieldAdapter.ts";

export type YextPuckFields = {
  basicSelector: BasicSelectorField;
  ctaSelector: CTASelectorField;
  code: CodeField;
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

export const toPuckFields = <
  Props extends DefaultComponentProps = DefaultComponentProps,
>(
  fields: YextFields<Props> | YextFieldMap<Props>
): Fields<Props> =>
  adaptYextFieldMap(
    fields as Record<string, YextFieldDefinition<any>>,
    (yextField) => ({
      ...yextField,
      type: "custom",
      render: ({ field: _, ...props }) =>
        createElement(YextAutoField, {
          ...(props as any),
          field: yextField,
        }),
    })
  ) as Fields<Props>;
