import {
  MaybeRTF,
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "@yext/visual-editor";
import React from "react";
import { resolveEmbeddedFieldsRecursively } from "./resolveYextEntityField";

/**
 * Converts a type TranslatableString to a string
 * @param translatableString
 * @param locale
 * @param document
 */
export const resolveTranslatableString = (
  translatableString: TranslatableString = "",
  locale: string = "en",
  document?: any
): string => {
  let resolvedString;
  if (typeof translatableString === "object") {
    if (locale in translatableString) {
      resolvedString = translatableString[locale];
    } else {
      return "";
    }
  } else {
    resolvedString = translatableString;
  }

  // If the document is provided, resolve any embedded fields in the string.
  return document
    ? resolveEmbeddedFieldsRecursively(resolvedString, document, locale)
    : resolvedString;
};

/**
 * Converts a type TranslatableRichText to string or RTF Element
 * @param translatableRichText
 * @param locale
 */
export const resolveTranslatableRichText = (
  translatableRichText: TranslatableRichText = "",
  locale: string = "en"
): string | React.ReactElement => {
  try {
    let value = translatableRichText;

    if (
      typeof translatableRichText !== "string" &&
      !isRichText(translatableRichText)
    ) {
      value = translatableRichText[locale];
    }

    return toStringOrElement(value);
  } catch (error) {
    console.warn("Error in resolveTranslatableRichText:", error);
    return "";
  }
};

function isRichText(value: unknown): value is RichText {
  return (
    typeof value === "object" &&
    value !== null &&
    ("html" in value || "json" in value)
  );
}

/**
 * Takes a TranslatableString and a locale and returns the value as a string
 * @param translatableString a TranslatableString
 * @param locale "en" or other locale value
 * @return string to be displayed in the editor input
 */
export function getDisplayValue(
  translatableString: TranslatableRichText,
  locale: string = "en"
): string {
  if (typeof translatableString === "string") {
    return translatableString;
  }

  if (isRichText(translatableString)) {
    return richTextToString(translatableString);
  }

  const localizedValue = translatableString[locale];

  if (isRichText(localizedValue)) {
    return richTextToString(localizedValue);
  }

  return localizedValue;
}

function richTextToString(rtf: RichText): string {
  return rtf.html || rtf.json || "";
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
  return value;
}
