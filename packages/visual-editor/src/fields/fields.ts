import type {
  ComponentConfig,
  DefaultComponentProps,
  Fields,
} from "@puckeditor/core";
import type { YextFieldDefinition } from "../editor/YextField.tsx";
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
  StyledTextField,
  StyledTextFieldOverride,
} from "./StyledTextField.tsx";
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
  optionalNumber: OptionalNumberField;
  styledText: StyledTextField;
  translatableString: TranslatableStringField;
  video: VideoField;
};

export type YextComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
> = ComponentConfig<{
  props: Props;
  fields: YextPuckFields;
}>;

// TODO(SUMO-8378): Remove this and make YextFieldsInternal -> YextFields once Puck fixes their objectField typing
export type YextFields<
  T extends DefaultComponentProps = DefaultComponentProps,
> = YextFieldsInternal<T> & YextFieldMap<T>;

type YextFieldsInternal<
  T extends DefaultComponentProps = DefaultComponentProps,
> = NonNullable<YextComponentConfig<T>["fields"]>;

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
  entityField: (...args: Parameters<typeof EntityFieldSelectorFieldOverride>) =>
    EntityFieldSelectorFieldOverride(...args),
  multiSelector: MultiSelectorFieldOverride,
  fontSizeSelector: FontSizeSelectorFieldOverride,
  image: ImageFieldOverride,
  optionalNumber: OptionalNumberFieldOverride,
  styledText: StyledTextFieldOverride,
  translatableString: TranslatableStringFieldOverride,
  video: VideoFieldOverride,
};
