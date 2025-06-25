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
  try {
    if (!translatableRichText) return "";

    if (
      typeof translatableRichText === "string" ||
      isRichText(translatableRichText)
    ) {
      return toStringOrElement(translatableRichText);
    }

    if (typeof translatableRichText === "object") {
      const localizedValue = translatableRichText[locale];
      if (localizedValue) {
        return toStringOrElement(localizedValue);
      }
    }

    return "";
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
 * Converts a "string | RichText" type to "string | React.ReactElement" which can be viewed on the page
 * @param value
 */
function toStringOrElement(
  value: string | RichText
): string | React.ReactElement {
  if (isRichText(value)) {
    return <MaybeRTF data={value} />;
  }

  // Ensure we only return strings
  if (typeof value === "string") {
    return value;
  }

  // If value is anything else (object, number, etc.), return empty string
  return "";
}
