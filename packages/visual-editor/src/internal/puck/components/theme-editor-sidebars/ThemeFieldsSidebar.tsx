import React from "react";
import {
  AutoField,
  FieldGroup,
  FieldLabel,
  FieldTab,
  type Field,
} from "@puckeditor/core";
import { pt } from "../../../../utils/i18n/platform.ts";
import { readThemeValues } from "../../../utils/internalThemeResolver.ts";
import {
  themeCategories,
  type ThemeCategory,
  type ThemeField,
  type ThemeFields,
} from "../../../theme/themeFields.ts";
import { OnThemeChangeFunc, ThemeData } from "../../../types/themeData.ts";
import { updateThemeWithCustomFontAssets } from "../../../utils/customFontAssets.ts";
import {
  defaultFonts,
  constructFontSelectOptions,
  getFontWeightOptionsForFontFamily,
  getFontStyleOptionsForFontFamily,
  type FontRegistry,
} from "../../../../utils/fonts/visualEditorFonts.ts";
import { ColorSelector } from "../../../../fields/ColorSelector.tsx";
import { FontSelector } from "../FontSelector.tsx";
import { FontWeightSelector } from "../FontWeightSelector.tsx";
import { FontStyleSelector } from "../FontStyleSelector.tsx";

type ThemeFieldsSidebarProps = {
  themeData: ThemeData;
  onThemeChange: OnThemeChangeFunc;
  customFonts?: FontRegistry;
};

export const ThemeFieldsSidebar = ({
  themeData,
  onThemeChange,
  customFonts,
}: ThemeFieldsSidebarProps) => {
  const values = readThemeValues(themeData);
  const changeField = (key: string, value: string | number) => {
    if (values[key] === value) return;
    const next = { ...values, [key]: value };
    onThemeChange(
      updateThemeWithCustomFontAssets({ themeValues: next, customFonts })
    );
  };
  const renderFields = (fields: ThemeFields = {}) =>
    Object.entries(fields).map(([fieldKey, field]) => (
      <FieldGroup.Item key={fieldKey}>
        <ThemeFieldControl
          fieldKey={fieldKey}
          field={field}
          values={values}
          customFonts={customFonts}
          onChange={(value) => changeField(fieldKey, value)}
        />
      </FieldGroup.Item>
    ));
  const renderGroups = (
    categories: Readonly<Record<string, ThemeCategory>>,
    parentKey: string,
    nested = false
  ): React.ReactNode =>
    Object.entries(categories).map(([categoryKey, category]) => {
      const groupKey = `${parentKey}.${categoryKey}`;
      return (
        <FieldGroup
          key={categoryKey}
          id={groupKey}
          label={pt(category.label)}
          variant={nested ? "flush" : "card"}
        >
          {renderFields(category.fields)}
          {renderGroups(category.subcategories ?? {}, groupKey, true)}
        </FieldGroup>
      );
    });
  return (
    <>
      {Object.entries(themeCategories).map(([categoryKey, category]) => (
        <FieldTab
          key={categoryKey}
          value={categoryKey}
          label={pt(category.label)}
        >
          <div className="theme-fields">
            {renderFields(category.fields)}
            {renderGroups(category.subcategories ?? {}, `theme.${categoryKey}`)}
          </div>
        </FieldTab>
      ))}
    </>
  );
};

export const ThemeFieldControl = ({
  fieldKey,
  field,
  values,
  onChange,
  customFonts = {},
}: {
  fieldKey: string;
  field: ThemeField;
  values: ThemeData;
  onChange: (value: string | number) => void;
  customFonts?: FontRegistry;
}) => {
  const value = values[fieldKey] ?? field.default;
  const fonts = { ...defaultFonts, ...customFonts };
  const label = pt(field.label);
  let control: React.ReactNode;
  switch (field.type) {
    case "fontFamily":
      control = (
        <FontSelector
          label={label}
          value={value}
          onChange={onChange}
          options={constructFontSelectOptions(fonts)}
        />
      );
      break;
    case "fontWeight":
    case "fontStyle": {
      const family = values[field.fontFamilyKey];
      const options =
        field.type === "fontWeight"
          ? getFontWeightOptionsForFontFamily(family, { fontList: fonts })
          : getFontStyleOptionsForFontFamily(family, { fontList: fonts });
      const Selector =
        field.type === "fontWeight" ? FontWeightSelector : FontStyleSelector;
      control = (
        <Selector
          label={label}
          value={value}
          onChange={onChange}
          options={options.map((option) => ({
            ...option,
            label: pt(option.label),
          }))}
        />
      );
      break;
    }
    default: {
      const puckField: Field =
        field.type === "color"
          ? {
              type: "custom",
              label,
              render: ColorSelector,
            }
          : field.type === "select"
            ? {
                type: "select",
                label,
                options: field.options.map((option) => ({
                  ...option,
                  label: pt(option.label),
                })),
              }
            : field.type === "placeholder"
              ? { type: "text", label }
              : { type: "number", label };
      const input = (
        <AutoField
          field={puckField}
          value={value}
          onChange={(next) =>
            onChange(next === "" || next == null ? field.default : next)
          }
        />
      );
      // AutoField's public API renders inputs without a visible label.
      // Custom color controls already render their own label.
      control =
        field.type === "color" ? (
          input
        ) : (
          <FieldLabel label={label}>{input}</FieldLabel>
        );
    }
  }
  return control;
};
