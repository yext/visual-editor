import type { ComponentConfig, DefaultComponentProps, Fields } from "@puckeditor/core";
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
  FontSizeSelectorField,
  FontSizeSelectorFieldOverride,
} from "./FontSizeSelectorField.tsx";

export type YextPuckFields = {
  basicSelector: BasicSelectorField;
  code: CodeField;
  dateTimeSelector: DateTimeSelectorField;
  fontSizeSelector: FontSizeSelectorField;
};

export type YextComponentConfig<
  Props extends DefaultComponentProps = DefaultComponentProps,
> = ComponentConfig<{
  props: Props;
  fields: YextPuckFields;
}>;

export type YextFields<
  T extends DefaultComponentProps = DefaultComponentProps,
> = NonNullable<YextComponentConfig<T>["fields"]>;

// For things like resolveFields, Puck does not currently let you override the return type
// so we need this function to satisfy the typing.
export const toPuckFields = <
  Props extends DefaultComponentProps = DefaultComponentProps,
>(
  fields: YextFields<Props>
): Fields<Props> => fields as unknown as Fields<Props>;

export const YextPuckFieldOverrides = {
  basicSelector: BasicSelectorFieldOverride,
  code: CodeFieldOverride,
  dateTimeSelector: DateTimeSelectorFieldOverride,
  fontSizeSelector: FontSizeSelectorFieldOverride,
};
