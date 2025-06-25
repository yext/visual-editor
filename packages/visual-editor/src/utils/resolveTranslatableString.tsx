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

    // Ensure translatableRichText is an object with the locale property
    if (
      typeof translatableRichText === "object" &&
      translatableRichText !== null
    ) {
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

/**
 * Safely renders a TranslatableRichText value, ensuring it never returns an object
 * @param translatableRichText
 * @param locale
 */
export const safeRenderTranslatableRichText = (
  translatableRichText?: TranslatableRichText,
  locale: string = "en"
): React.ReactElement | string => {
  try {
    const result = resolveTranslatableRichText(translatableRichText, locale);

    // If result is already a React element or string, return it
    if (React.isValidElement(result) || typeof result === "string") {
      return result;
    }

    // If result is an object or anything else, return empty string
    return "";
  } catch (error) {
    console.warn("Error rendering TranslatableRichText:", error);
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
