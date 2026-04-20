import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

type ThemeOptionKey = keyof typeof ThemeOptions;

export type BasicSelectorOptions =
  | ComboboxOption[]
  | (() => ComboboxOption[])
  | ThemeOptionKey;

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
  | BasicSelectorFieldWithOptions
  | BasicSelectorFieldWithGroups;

type BasicSelectorFieldProps = FieldProps<BasicSelectorField>;

const isThemeOptionKey = (value: string): value is ThemeOptionKey =>
  value in ThemeOptions;

const isComboboxOptionGroup = (value: unknown): value is ComboboxOptionGroup =>
  typeof value === "object" &&
  value !== null &&
  "options" in value &&
  Array.isArray((value as ComboboxOptionGroup).options);

const isComboboxOptionGroupArray = (
  value: unknown
): value is ComboboxOptionGroup[] =>
  Array.isArray(value) && value.every((item) => isComboboxOptionGroup(item));

const INVALID_THEME_OPTIONS_MESSAGE =
  "Use a valid ThemeOptions key or pass explicit options.";

export const BasicSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: BasicSelectorFieldProps) => {
  const {
    label,
    translateOptions = true,
    noOptionsPlaceholder = pt(
      "basicSelectorNoOptionsLabel",
      "No options available"
    ),
    noOptionsMessage: providedNoOptionsMessage,
    disableSearch,
  } = field;

  const resolvedThemeOptions =
    field.optionGroups === undefined && typeof field.options === "string"
      ? isThemeOptionKey(field.options)
        ? ThemeOptions[field.options]
        : undefined
      : undefined;

  const invalidThemeOptionsKey =
    field.optionGroups === undefined &&
    typeof field.options === "string" &&
    !isThemeOptionKey(field.options);

  React.useEffect(() => {
    if (invalidThemeOptionsKey) {
      console.warn(
        `Invalid ThemeOptions key "${field.options}" passed to basicSelector.`
      );
    }
  }, [field.options, invalidThemeOptionsKey]);

  const resolvedOptionsSource = invalidThemeOptionsKey
    ? []
    : (resolvedThemeOptions ??
      (field.optionGroups === undefined ? field.options : undefined));

  const options: ComboboxOption[] =
    field.optionGroups === undefined
      ? typeof resolvedOptionsSource === "function"
        ? resolvedOptionsSource()
        : isComboboxOptionGroupArray(resolvedOptionsSource)
          ? []
          : typeof resolvedOptionsSource === "string"
            ? []
            : (resolvedOptionsSource ?? [])
      : [];
  const optionGroups: ComboboxOptionGroup[] =
    field.optionGroups ??
    (isComboboxOptionGroupArray(resolvedOptionsSource)
      ? resolvedOptionsSource
      : [{ options }]);
  const noOptionsMessage =
    providedNoOptionsMessage ??
    (invalidThemeOptionsKey ? INVALID_THEME_OPTIONS_MESSAGE : undefined);

  const translatedOptionGroups = translateOptions
    ? optionGroups.map((group) => ({
        title: group.title && pt(group.title),
        description: group.description && pt(group.description),
        options: group.options.map((option) => ({
          ...option,
          label: pt(option.label),
        })),
      }))
    : optionGroups;

  const serializedOptions = translatedOptionGroups.reduce(
    (allOptions, group) => allOptions.concat(group.options),
    [] as ComboboxOption[]
  );
  const translatedLabel = label && pt(label);
  const noOptions = serializedOptions.length === 0;

  if (noOptions) {
    return (
      <>
        {translatedLabel && <FieldLabel label={translatedLabel} />}
        <Button variant="puckSelect" disabled={true}>
          {pt(noOptionsPlaceholder)}
        </Button>
        {noOptionsMessage && (
          <p className="ve-text-xs ve-mt-3">{pt(noOptionsMessage)}</p>
        )}
      </>
    );
  }

  const selector = (
    <Combobox
      selectedOption={
        serializedOptions.find(
          (option) => JSON.stringify(option.value) === JSON.stringify(value)
        ) ?? serializedOptions[0]
      }
      onChange={onChange}
      optionGroups={translatedOptionGroups}
      disabled={noOptions}
      disableSearch={disableSearch}
    />
  );

  return translatedLabel ? (
    <FieldLabel label={translatedLabel}>{selector}</FieldLabel>
  ) : (
    selector
  );
};
