import { MaybeRTF, RTF2, TranslatableString } from "@yext/visual-editor";
import React from "react";

/**
 * Converts a type TranslatableString to a type that can be viewed on the page
 * @param translatableString
 * @param locale
 */
export const resolveTranslatableString = (
  translatableString?: TranslatableString,
  locale?: string
): string | React.ReactElement => {
  locale = locale ?? "en";
  if (!translatableString) {
    return "";
  }

  if (typeof translatableString === "string" || isRTF2(translatableString)) {
    return toStringOrElement(translatableString);
  }

  if (typeof translatableString === "object") {
    if (locale in translatableString) {
      return toStringOrElement(translatableString[locale]);
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
