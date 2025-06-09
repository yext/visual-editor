import {
  MaybeRTF,
  RTF2,
  TranslatableRTF2,
  TranslatableString,
} from "@yext/visual-editor";
import React from "react";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";

/**
 * Converts a type TranslatableString to a string
 * @param translatableString
 * @param locale
 */
export const resolveTranslatableString = (
  translatableString?: TranslatableString,
  locale?: string
): string => {
  locale = locale ?? "en";
  if (!translatableString) {
    return "";
  }

  if (typeof translatableString === "string") {
    return translatableString;
  }

  if (typeof translatableString === "object") {
    if (locale in translatableString) {
      return translatableString[locale];
    }
  }

  return "";
};

/**
 * Converts a type TranslatableRTF2 to a type that can be viewed on the page
 * @param translatableRTF2
 * @param locale
 */
export const resolveTranslatableRTF2 = (
  translatableRTF2?: TranslatableRTF2,
  locale?: string
): string | React.ReactElement => {
  locale = locale ?? "en";
  if (!translatableRTF2) {
    return "";
  }

  if (typeof translatableRTF2 === "string" || isRTF2(translatableRTF2)) {
    return toStringOrElement(translatableRTF2);
  }

  if (typeof translatableRTF2 === "object") {
    if (locale in translatableRTF2) {
      return toStringOrElement(translatableRTF2[locale]);
    }
  }

  return "";
};

/**
 * Takes a TranslatableString and a locale and returns the value to be displayed in the editor input
 * @param translatableString a TranslatableString
 * @param locale "en" or other locale value
 * @return string to be displayed in the editor input
 */
export function getDisplayValue(
  translatableString?: TranslatableRTF2,
  locale?: string
): string {
  if (!translatableString) {
    return "";
  }
  if (!locale) {
    locale = "en";
  }
  if (typeof translatableString === "string") {
    return translatableString;
  }

  if (isRTF2(translatableString)) {
    return rtf2ToString(translatableString);
  }

  const localizedValue: string | RTF2 = translatableString[locale];

  if (typeof localizedValue === "string") {
    return localizedValue;
  }

  if (isRTF2(localizedValue)) {
    return rtf2ToString(localizedValue);
  }

  return "";
}

/**
 * Takes in the document and returns the set of locales using document.locale, document._pageset.scope.locales, and templateMetadata.locales
 * @param document
 */
export function resolveLocales(document: any): string[] {
  const localesSet: Set<string> = new Set<string>();
  if (document?.locale) {
    localesSet.add(document.locale);
  }

  const templateMetadata = useTemplateMetadata();
  templateMetadata.locales.forEach((locale: string) => {
    localesSet.add(locale);
  });

  if (localesSet.size == 0) {
    localesSet.add(document?.locale);
  }

  if (typeof document?._pageset === "string") {
    const parsed = JSON.parse(document._pageset);
    if (Array.isArray(parsed?.scope?.locales)) {
      parsed?.scope?.locales?.forEach((locale: any) => {
        if (typeof locale === "string") {
          localesSet.add(locale);
        }
      });
    }
  }

  if (localesSet.size == 0) {
    localesSet.add("en");
  }

  return Array.from(localesSet);
}

function rtf2ToString(rtf: RTF2): string {
  return rtf.html || rtf.json || "";
}

function isRTF2(value: unknown): value is RTF2 {
  return (
    typeof value === "object" &&
    value !== null &&
    ("html" in value || "json" in value)
  );
}

/**
 * Converts a "string | RTF2" type to "string | React.ReactElement" which can be viewed on the page
 * @param value
 */
function toStringOrElement(value: string | RTF2): string | React.ReactElement {
  if (isRTF2(value)) {
    return MaybeRTF({ data: value }) ?? "";
  }
  return value?.toString() ?? "";
}
