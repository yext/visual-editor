import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";
import {
  BasicSelectorField,
  BasicSelectorFieldOverride,
} from "./BasicSelectorField.tsx";
import { CodeField, CodeFieldOverride } from "./CodeField.tsx";
import {
  FontSizeSelectorField,
  FontSizeSelectorFieldOverride,
} from "./FontSizeSelectorField.tsx";

export type YextPuckFields = {
  basicSelector: BasicSelectorField;
  code: CodeField;
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
> = YextComponentConfig<T>["fields"];

export const YextPuckFieldOverrides = {
  basicSelector: BasicSelectorFieldOverride,
  code: CodeFieldOverride,
  fontSizeSelector: FontSizeSelectorFieldOverride,
};
