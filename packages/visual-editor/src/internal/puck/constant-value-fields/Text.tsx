import { AutoField, CustomField, TextField, FieldLabel } from "@measured/puck";
import React from "react";
import { TranslatableString } from "../../../editor/YextEntityFieldSelector.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_TEXT_CONSTANT_CONFIG: CustomField<TranslatableString> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: any = useDocument();

      const locales: string[] = [document?.locale ?? "en"];
      if (typeof document?._pageset === "string") {
        const parsedPageset = JSON.parse(document?._pageset || "");
        const scopeLocales: string[] = parsedPageset?.scope?.locales;

        (scopeLocales ?? []).forEach((locale: string) => {
          locales.push(locale);
        });
      }

      // TODO remove these
      ["es", "fr"].forEach((locale) => {
        locales.push(locale);
      });

      // TODO replace "en" with platform locale
      return (
        <>
          {locales.map((locale: string) => {
            const displayValue =
              typeof value === "object" && !Array.isArray(value)
                ? (value[locale] ?? "")
                : typeof value === "string"
                  ? value
                  : "";

            return (
              <FieldLabel key={locale} label={getLocaleName(locale, "en")}>
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
