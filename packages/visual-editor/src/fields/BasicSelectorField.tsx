import React from "react";
import { BaseField, type FieldProps } from "@puckeditor/core";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { type MsgString } from "../utils/i18n/platform.ts";
import { BasicSelectorCombobox } from "./BasicSelectorCombobox.tsx";
import { ThemeColorFieldOverride } from "./ThemeColorField.tsx";

type ThemeOptionKey = keyof typeof ThemeOptions;

export type BasicSelectorOptions =
  ComboboxOption[] | (() => ComboboxOption[]) | ThemeOptionKey;

/**
  Example usage:

  import type { PuckComponent } from "@puckeditor/core";
  import { msg } from "../utils/i18n/platform.ts";
  import { YextComponentConfig, YextFields } from "./fields.ts";

  export type MyComponentProps = {
    foo: string;
  };

  const myComponentFields: YextFields<MyComponentProps> = {
    foo: {
      type: "basicSelector",
      label: msg("tone", "Tone"),
      options: [
        { label: msg("foo.options.neutral", "Neutral"), value: "neutral" },
        { label: msg("foo.options.bold", "Bold"), value: "bold" },
      ],
      disableSearch: false,
    },
  };

  const MyComponentWrapper: PuckComponent<MyComponentProps> = ({ foo }) => {
    return <div>{foo}</div>;
  };

  export const MyComponent: YextComponentConfig<MyComponentProps> = {
    label: msg("components.myComponent", "My Component"),
    fields: myComponentFields,
    // resolveData: (data) => {...},
    render: (props) => <MyComponentWrapper {...props} />,
  };
 */
type BasicSelectorFieldBase = BaseField & {
  type: "basicSelector";
  label?: string | MsgString;
  visible?: boolean;
  translateOptions?: boolean;
  noOptionsPlaceholder?: string | MsgString;
  noOptionsMessage?: string | MsgString;
  disableSearch?: boolean;
};

type BasicSelectorFieldWithOptions = BasicSelectorFieldBase & {
  options: BasicSelectorOptions;
  optionGroups?: never;
};

type BasicSelectorFieldWithGroups = BasicSelectorFieldBase & {
  options?: never;
  optionGroups: ComboboxOptionGroup[];
};

export type BasicSelectorField =
  BasicSelectorFieldWithOptions | BasicSelectorFieldWithGroups;

/** Keeps shipped color selectors editable while new configs use themeColor. */
export const BasicSelectorFieldOverride = (
  props: FieldProps<BasicSelectorField>
) => {
  if (
    props.field.optionGroups === undefined &&
    (props.field.options === "SITE_COLOR" ||
      props.field.options === "BACKGROUND_COLOR")
  ) {
    return (
      <ThemeColorFieldOverride
        {...props}
        field={{
          ...props.field,
          type: "themeColor",
          options: props.field.options,
        }}
      />
    );
  }

  return <BasicSelectorCombobox {...props} />;
};
