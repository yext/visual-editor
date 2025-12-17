import { TranslatableString } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18n/platform.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import {
  EmbeddedFieldStringInputFromEntity,
  EmbeddedFieldStringInputFromOptions,
} from "./EmbeddedFieldStringInput.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import { TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { DynamicOption } from "./DynamicOptionsSelector.tsx";
import { useDocument } from "../hooks/useDocument.tsx";

/**
 * Generates a translatable string config
 * @param label optional label. Takes in a value from msg.
 * @param filter optional filter for the entity fields that can be embedded.
 * @param showApplyAllOption enables the "Apply to All Locales" button
 * @param showFieldSelector enables the button to select an entity field to embed
 * @param getOptions optional function to get options for the field selector. If provided, the entity field filter is ignored.
 */
export function TranslatableStringField<
  T extends TranslatableString | undefined = TranslatableString,
>(
  label?: MsgString,
  filter?: RenderEntityFieldFilter<any>,
  showApplyAllOption?: boolean,
  showFieldSelector?: boolean,
  getOptions?: () => DynamicOption<string>[]
): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const { i18n } = useTranslation();
      const locale = i18n.language;
      const resolvedValue = value && resolveComponentData(value, locale);
      const templateMetadata: TemplateMetadata = useTemplateMetadata();
      const streamDocument = useDocument();

      let locales = templateMetadata?.locales || [];
      if (locales.length === 0) {
        try {
          locales = JSON.parse(streamDocument._pageset).scope.locales;
        } catch {
          console.warn("failed to retrieve locales from page group");
        }
      }

      const applyAllButton = showApplyAllOption ? (
        <Button
          size="sm"
          variant="small_link"
          onClick={() => {
            const valueByLocale: TranslatableString = {
              hasLocalizedValue: "true",
              ...locales.reduce(
                (acc, locale) => {
                  acc[locale] = resolvedValue;
                  return acc;
                },
                {} as Record<string, string>
              ),
            };
            onChange(valueByLocale as T);
          }}
          className={"ve-px-0 ve-h-auto"}
        >
          {pt("applyAll", "Apply to all locales")}
        </Button>
      ) : null;

      const fieldEditor = (
        <>
          {getOptions ? (
            <EmbeddedFieldStringInputFromOptions
              value={resolvedValue}
              onChange={(val: any) => {
                return onChange({
                  ...(typeof value === "object" && !Array.isArray(value)
                    ? value
                    : {}),
                  [locale]: val,
                  hasLocalizedValue: "true",
                } as Record<string, string> as T);
              }}
              options={getOptions?.()
                .filter(
                  (opt): opt is { label: string; value: string } =>
                    opt.value !== undefined
                )
                .map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
              showFieldSelector={showFieldSelector ?? true}
              useOptionValueSublabel={true}
            />
          ) : (
            <EmbeddedFieldStringInputFromEntity
              value={resolvedValue}
              onChange={(val: any) => {
                return onChange({
                  ...(typeof value === "object" && !Array.isArray(value)
                    ? value
                    : {}),
                  [locale]: val,
                  hasLocalizedValue: "true",
                } as Record<string, string> as T);
              }}
              filter={filter ?? { types: ["type.string"] }}
              showFieldSelector={showFieldSelector ?? true}
            />
          )}
          {applyAllButton}
        </>
      );

      if (!label) {
        return <div className={"ve-pt-3"}>{fieldEditor}</div>;
      }

      return (
        <FieldLabel label={`${pt(label)} (${locale})`}>
          {fieldEditor}
        </FieldLabel>
      );
    },
  };
}
