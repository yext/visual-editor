import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { useDocument } from "../hooks/useDocument.tsx";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  EmbeddedFieldStringInputFromEntity,
  EmbeddedFieldStringInputFromOptions,
  type EmbeddedStringOption,
} from "../editor/EmbeddedFieldStringInput.tsx";
import { TranslatableString } from "../types/types.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { getPageSetLocales } from "../utils/pageSetLocales.ts";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";

export type TranslatableStringField = BaseField & {
  type: "translatableString";
  label?: string | MsgString;
  visible?: boolean;
  filter?: RenderEntityFieldFilter<any>;
  showApplyAllOption?: boolean;
  showFieldSelector?: boolean;
  getOptions?: () => EmbeddedStringOption[];
};

type TranslatableStringFieldProps = FieldProps<
  TranslatableStringField,
  TranslatableString | undefined
>;

export const TranslatableStringFieldOverride = ({
  field,
  onChange,
  value,
}: TranslatableStringFieldProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const resolvedValue = value && resolveComponentData(value, locale);
  const streamDocument = useDocument();
  const locales = getPageSetLocales(streamDocument);

  const applyAllButton =
    field.showApplyAllOption && locales.length > 1 ? (
      <Button
        size="sm"
        variant="small_link"
        onClick={() => {
          const valueByLocale: TranslatableString = {
            hasLocalizedValue: "true",
            ...locales.reduce(
              (acc, localeKey) => {
                acc[localeKey] = resolvedValue;
                return acc;
              },
              {} as Record<string, string | undefined>
            ),
          };
          onChange(valueByLocale);
        }}
        className={"ve-px-0 ve-h-auto"}
      >
        {pt("applyAll", "Apply to all locales")}
      </Button>
    ) : null;

  const handleChange = (nextValue: string) => {
    onChange({
      ...(typeof value === "object" && !Array.isArray(value) ? value : {}),
      [locale]: nextValue,
      hasLocalizedValue: "true",
    });
  };

  const fieldEditor = (
    <>
      {field.getOptions ? (
        <EmbeddedFieldStringInputFromOptions
          value={resolvedValue ?? ""}
          onChange={handleChange}
          optionGroups={[
            {
              options: field
                .getOptions()
                .filter(
                  (option): option is { label: string; value: string } =>
                    option.value !== undefined
                )
                .map((option) => ({
                  label: option.label,
                  value: option.value,
                })),
            },
          ]}
          showFieldSelector={field.showFieldSelector ?? true}
          useOptionValueSublabel={true}
        />
      ) : (
        <EmbeddedFieldStringInputFromEntity
          value={resolvedValue ?? ""}
          onChange={handleChange}
          filter={field.filter ?? { types: ["type.string"] }}
          showFieldSelector={field.showFieldSelector ?? true}
        />
      )}
      {applyAllButton}
    </>
  );

  if (!field.label) {
    return <div className={"ve-pt-3"}>{fieldEditor}</div>;
  }

  return (
    <FieldLabel label={`${pt(field.label)} (${locale})`}>
      {fieldEditor}
    </FieldLabel>
  );
};
