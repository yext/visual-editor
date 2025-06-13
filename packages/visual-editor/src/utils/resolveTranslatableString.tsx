import {
  MaybeRTF,
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "@yext/visual-editor";
import React from "react";

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
 * Converts a type TranslatableRichText to a type that can be viewed on the page
 * @param translatableRichText
 * @param locale
 */
export const resolveTranslatableRichText = (
  translatableRichText?: TranslatableRichText,
  locale: string = "en"
): string | React.ReactElement => {
  if (!translatableRichText) return "";

  if (
    typeof translatableRichText === "string" ||
    isRichText(translatableRichText)
  ) {
    return toStringOrElement(translatableRichText);
  }

  const localizedValue = translatableRichText[locale];
  if (localizedValue) {
    return toStringOrElement(localizedValue);
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
  translatableString?: TranslatableRichText,
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

  if (isRichText(translatableString)) {
    return richTextToString(translatableString);
  }

  const localizedValue: string | RichText = translatableString[locale];

  if (typeof localizedValue === "string") {
    return localizedValue;
  }

  if (isRichText(localizedValue)) {
    return richTextToString(localizedValue);
  }

  return "";
}

function richTextToString(rtf: RichText): string {
  return rtf.html || rtf.json || "";
}

function isRichText(value: unknown): value is RichText {
  return (
    typeof value === "object" &&
    value !== null &&
    ("html" in value || "json" in value)
  );
}

/**
 * Converts a "string | RichText" type to "string | React.ReactElement" which can be viewed on the page
 * @param value
 */
function toStringOrElement(
  value: string | RichText
): string | React.ReactElement {
  if (isRichText(value)) {
    return <MaybeRTF data={value} />;
  }
  return value ?? "";
}
