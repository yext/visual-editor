import {
  MaybeRTF,
  RichText,
  TranslatableRichText,
  TranslatableString,
  YextEntityField,
} from "@yext/visual-editor";
import React from "react";
import {
  resolveEmbeddedFieldsRecursively,
  resolveEmbeddedFieldsInString,
  resolveYextEntityField,
} from "./resolveYextEntityField";

/**
 * The primary function for resolving all component data. It handles entity
 * fields, constant values, embedded fields, and translatable types.
 *
 * @param data The field configuration object from component props OR a direct translatable value.
 * @param locale The current language locale (e.g., "en").
 * @param document The entity document. If not provided, embedded fields will not be resolved.
 * @returns The fully resolved data for the component.
 */
// --- Overload Signatures ---
// 1. Handles TranslatableString directly or via a YextEntityField
export function resolveComponentData(
  data: TranslatableString | YextEntityField<TranslatableString>,
  locale: string,
  document?: any
): string;

// 2. Handles TranslatableRichText directly or via a YextEntityField
export function resolveComponentData(
  data: TranslatableRichText | YextEntityField<TranslatableRichText>,
  locale: string,
  document?: any
): string | React.ReactElement;

// 3. Handles a generic YextEntityField
export function resolveComponentData<T>(
  data: YextEntityField<T>,
  locale: string,
  document?: any
): T | undefined;

// --- Implementation ---
export function resolveComponentData<T>(
  data: YextEntityField<T> | TranslatableString | TranslatableRichText,
  locale: string,
  document?: any
): any {
  let rawValue;

  // If a document is provided, we can attempt full resolution.
  if (document) {
    if (isYextEntityField(data)) {
      rawValue = resolveYextEntityField(document, data, locale);
    } else {
      // It's a direct TranslatableString or TranslatableRichText.
      rawValue = resolveEmbeddedFieldsRecursively(data, document, locale);
    }
  } else {
    // No document, so we can't resolve entity fields or embedded fields.
    // If it's a YextEntityField, we can only use its constant value.
    rawValue = isYextEntityField(data) ? data.constantValue : data;
  }

  // Fully resolve the resulting value, converting any translatable
  // objects into their final string or React element form.
  return resolveTranslatableType(rawValue, locale);
}

/**
 * Recursively traverses a value and resolves any translatable types
 * (TranslatableString, TranslatableRichText) to their final form.
 */
const resolveTranslatableType = (
  value: any,
  locale: string
): any | string | React.ReactElement => {
  // If the value is already a React element, return it immediately.
  if (React.isValidElement(value)) {
    return value;
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  // Handle TranslatableString
  if (value.hasLocalizedValue === "true" && typeof value[locale] === "string") {
    return value[locale];
  }

  // Handle TranslatableRichText
  if (value.hasLocalizedValue === "true" && isRichText(value[locale])) {
    return toStringOrElement(value[locale]);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTranslatableType(item, locale));
  }

  // If it's an object, recursively resolve each property.
  const newValue: { [key: string]: any } = {};
  for (const key in value) {
    newValue[key] = resolveTranslatableType(value[key], locale);
  }
  return newValue;
};

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
    ? resolveEmbeddedFieldsInString(resolvedString, document, locale)
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
 * Takes a TranslatableString or TranslatableRichText and a locale and returns the value as a string
 * @param translatableText a TranslatableRichText
 * @param locale "en" or other locale value
 * @return string to be displayed in the editor input
 */
export function getDisplayValue(
  translatableText: TranslatableString | TranslatableRichText,
  locale: string = "en"
): string {
  if (typeof translatableText === "string") {
    return translatableText;
  }

  if (isRichText(translatableText)) {
    return richTextToString(translatableText);
  }

  const localizedValue = translatableText[locale];

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

/**
 * Check if the input is a YextEntityField
 * @param value
 * @returns
 */
function isYextEntityField(value: any): value is YextEntityField<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    "constantValue" in value
  );
}
