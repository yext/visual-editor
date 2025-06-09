import { AutoField, CustomField, TextField, FieldLabel } from "@measured/puck";
import React from "react";
import { TranslatableString } from "../../../types/types.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.ts";
import { useTranslation } from "react-i18next";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_TEXT_CONSTANT_CONFIG: CustomField<TranslatableString> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: any = useDocument();
      const { i18n } = useTranslation();

      const locales: string[] = [document?.locale ?? "en"];
      if (typeof document?._pageset === "string") {
        const parsedPageset = JSON.parse(document?._pageset || "");
        const scopeLocales: string[] = parsedPageset?.scope?.locales;

        (scopeLocales ?? []).forEach((locale: string) => {
          locales.push(locale);
        });
      }

      return (
        <>
          {locales.map((locale: string) => {
            const displayValue: string = getDisplayValue(value, locale);
            const autoField: React.ReactElement = (
              <AutoField
                field={{ type: "text" }}
                value={displayValue}
                onChange={(val) =>
                  onChange({
                    ...(typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value)
                      ? value
                      : {}),
                    [locale]: val,
                  })
                }
              />
            );
            if (locales.length <= 1) {
              return autoField;
            }
            return (
              <FieldLabel
                key={locale}
                label={getLocaleName(locale, i18n.language)}
              >
                {autoField}
              </FieldLabel>
            );
          })}
        </>
      );
    },
  };

/**
 * Takes in a locale code like "es" and translates to the name using the targetLang
 * ex: getLocaleName("es", "en") -> "Spanish"
 * @param code
 * @param targetLang
 */
export function getLocaleName(code: string, targetLang: string): string {
  const displayNames = new Intl.DisplayNames([targetLang], {
    type: "language",
  });
  return displayNames.of(code) ?? "";
}
