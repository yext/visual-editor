import React from "react";
import { FieldLabel, type FieldProps } from "@puckeditor/core";
import { Combobox } from "../internal/puck/ui/Combobox.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { pt } from "../utils/i18n/platform.ts";
import type { BasicSelectorField } from "./BasicSelectorField.tsx";

type ThemeOptionKey = keyof typeof ThemeOptions;

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

/** Renders generic option groups and passes the selected option value through. */
export const BasicSelectorCombobox = ({
  field,
  value,
  onChange,
}: FieldProps<BasicSelectorField>) => {
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

  const selectedOption =
    serializedOptions.find(
      (option) => JSON.stringify(option.value) === JSON.stringify(value)
    ) ?? serializedOptions[0];

  const selector = (
    <Combobox
      selectedOption={selectedOption}
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
