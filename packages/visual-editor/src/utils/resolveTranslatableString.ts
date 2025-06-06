import { MaybeRTF, RTF2, TranslatableString } from "@yext/visual-editor";
import React from "react";

/**
 * Converts a type TranslatableString to a type that can be viewed on the page
 * @param translatableString
 */
export const resolveTranslatableString = (
  translatableString?: TranslatableString
): string | React.ReactElement => {
  if (!translatableString) {
    return "";
  }

  if (typeof translatableString === "string" || isRTF2(translatableString)) {
    return toStringOrElement(translatableString);
  }

  if (typeof translatableString === "object") {
    const detectedLanguage = getBrowserLanguage();
    if (detectedLanguage in translatableString) {
      return toStringOrElement(translatableString[detectedLanguage]);
    } else if ("en" in translatableString) {
      // TODO: Have a fallback language that isn't just English
      return toStringOrElement(translatableString["en"]);
    }
  }

  return "";
};

/**
 * Takes a TranslatableString and a locale and returns the value to be displayed
 * @param translatableString a TranslatableString
 * @param locale "en" or other locale value
 * @return string a string to be displayed in the editor input
 */
export function getDisplayValue(
  translatableString: TranslatableString,
  locale: string
): string {
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

// TODO - replace with document i18n
// Utility function to detect browser language
const getBrowserLanguage = (): string => {
  const browserLocales = navigator.languages || [navigator.language];
  if (!browserLocales || browserLocales.length === 0) {
    return "en"; // Fallback to English
  }
  // Return primary language code (e.g., "en" from "en-US")
  return browserLocales[0].split("-")[0];
};

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
  const isRTF2: boolean =
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("html" in value || "json" in value) &&
    ((value as any).html === undefined ||
      typeof (value as any).html === "string") &&
    ((value as any).json === undefined ||
      typeof (value as any).json === "string");
  if (isRTF2) {
    return MaybeRTF({ data: value }) ?? "";
  }
  return value?.toString() ?? "";
}
