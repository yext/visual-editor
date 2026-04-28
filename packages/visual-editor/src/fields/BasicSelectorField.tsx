import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { ThemeOptions, type ThemeColor } from "../utils/themeConfigOptions.ts";
import { msg, pt, type MsgString } from "../utils/i18n/platform.ts";
import { ColorPickerInput } from "../internal/puck/components/ColorSelector.tsx";
import {
  getContrastingColor,
  getThemeColorHexValue,
  isCustomThemeColorToken,
} from "../utils/colors.ts";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";

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

// The combobox returns only option.value, so use a marker value to detect
// the Other option before converting it to a ThemeColor.
const CUSTOM_COLOR_OPTION_VALUE = "__visual_editor_custom_color__";

const isThemeOptionKey = (value: string): value is ThemeOptionKey => {
  return value in ThemeOptions;
};

const isComboboxOptionGroup = (
  value: unknown
): value is ComboboxOptionGroup => {
  return (
    typeof value === "object" &&
    value !== null &&
    "options" in value &&
    Array.isArray((value as ComboboxOptionGroup).options)
  );
};

const isComboboxOptionGroupArray = (
  value: unknown
): value is ComboboxOptionGroup[] => {
  return (
    Array.isArray(value) && value.every((item) => isComboboxOptionGroup(item))
  );
};

const isThemeColorValue = (value: unknown): value is ThemeColor => {
  return (
    typeof value === "object" &&
    value !== null &&
    "selectedColor" in value &&
    typeof (value as ThemeColor).selectedColor === "string"
  );
};

const isCustomThemeColorValue = (value: unknown): value is ThemeColor => {
  return (
    isThemeColorValue(value) && isCustomThemeColorToken(value.selectedColor)
  );
};

const toCustomThemeColor = (hexColor: string): ThemeColor => {
  const selectedColor = hexColor.toUpperCase();
  const contrastingColor =
    getContrastingColor(selectedColor, 12, 400) === "#FFFFFF"
      ? "white"
      : "black";

  return {
    selectedColor: `[${selectedColor}]`,
    contrastingColor,
    isDarkColor: contrastingColor === "white",
  };
};

export const BasicSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: BasicSelectorFieldProps) => {
  const templateProps = React.useContext(TemplatePropsContext);
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
  const noOptionsMessage = providedNoOptionsMessage ?? undefined;
  const isThemeColorSelector =
    field.optionGroups === undefined &&
    (field.options === "SITE_COLOR" || field.options === "BACKGROUND_COLOR");
  const customColorHex =
    getThemeColorHexValue(
      isThemeColorValue(value) ? value.selectedColor : undefined,
      templateProps?.document
    ) ?? "#000000";
  const customColorOption: ComboboxOption = {
    label: msg("fields.options.other", "Other"),
    value: CUSTOM_COLOR_OPTION_VALUE,
    colorStyle: { backgroundColor: customColorHex },
  };
  const optionGroupsWithCustomColor: ComboboxOptionGroup[] =
    isThemeColorSelector
      ? [
          ...optionGroups,
          {
            title: msg("fields.customColor", "Custom Color"),
            options: [customColorOption],
          },
        ]
      : optionGroups;

  const translatedOptionGroups = translateOptions
    ? optionGroupsWithCustomColor.map((group) => ({
        title: group.title && pt(group.title),
        description: group.description && pt(group.description),
        options: group.options.map((option) => ({
          ...option,
          label: pt(option.label),
        })),
      }))
    : optionGroupsWithCustomColor;

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

  const selectedOption =
    isThemeColorSelector && isCustomThemeColorValue(value)
      ? (serializedOptions.find(
          (option) => option.value === CUSTOM_COLOR_OPTION_VALUE
        ) ?? serializedOptions[0])
      : (serializedOptions.find(
          (option) => JSON.stringify(option.value) === JSON.stringify(value)
        ) ?? serializedOptions[0]);

  const handleChange = (nextValue: unknown) => {
    if (isThemeColorSelector && nextValue === CUSTOM_COLOR_OPTION_VALUE) {
      onChange(toCustomThemeColor(customColorHex));
      return;
    }

    onChange(nextValue);
  };

  const selector = (
    <Combobox
      selectedOption={selectedOption}
      onChange={handleChange}
      optionGroups={translatedOptionGroups}
      disabled={noOptions}
      disableSearch={disableSearch}
    />
  );
  const customColorPicker = isThemeColorSelector &&
    isCustomThemeColorValue(value) && (
      <div className="ve-mt-3">
        <FieldLabel label={pt("fields.customColor", "Custom Color")} el="div">
          <ColorPickerInput
            ariaLabel={pt("colorPicker.open", "Open color picker")}
            value={customColorHex}
            onChange={(nextColor) => onChange(toCustomThemeColor(nextColor))}
          />
        </FieldLabel>
      </div>
    );

  return (
    <>
      {translatedLabel ? (
        <FieldLabel label={translatedLabel}>{selector}</FieldLabel>
      ) : (
        selector
      )}
      {customColorPicker}
    </>
  );
};
