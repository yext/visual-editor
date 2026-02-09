import { BodyProps } from "../components/atoms/body.tsx";
import { MaybeRTF } from "../components/atoms/maybeRTF.tsx";
import {
  type RichText,
  type TranslatableRichText,
  type TranslatableString,
} from "../types/types.ts";
import { type YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import React from "react";
import {
  resolveEmbeddedFieldsRecursively,
  resolveYextEntityField,
} from "./resolveYextEntityField.ts";
import {
  getLocalizedPlainText,
  isRichText,
  richTextToPlainText,
} from "./plainText.ts";

type ResolveComponentDataOptions = {
  variant?: BodyProps["variant"];
  isDarkBackground?: boolean;
  className?: string;
  output?: "render" | "plainText";
};

/**
 * The primary function for resolving all component data. It handles entity
 * fields, constant values, embedded fields, and translatable types.
 *
 * @param data The field configuration object from component props OR a direct translatable value.
 * @param locale The current language locale (e.g., "en").
 * @param streamDocument The entity document. If not provided, embedded fields will not be resolved.
 * @returns The fully resolved data for the component.
 */
// --- Overload Signatures ---
// 1. Handles TranslatableString directly or via a YextEntityField
export function resolveComponentData(
  data: TranslatableString | YextEntityField<TranslatableString>,
  locale: string,
  streamDocument?: any
): string;

// 2. Handles TranslatableRichText directly or via a YextEntityField
export function resolveComponentData(
  data: TranslatableRichText | YextEntityField<TranslatableRichText>,
  locale: string,
  streamDocument?: Record<string, any>,
  options?: ResolveComponentDataOptions
): string | React.ReactElement;

// 3. Handles text-only output mode for translatable text.
export function resolveComponentData(
  data:
    | TranslatableString
    | TranslatableRichText
    | YextEntityField<TranslatableString | TranslatableRichText>
    | undefined,
  locale: string,
  streamDocument: Record<string, any> | undefined,
  options: ResolveComponentDataOptions & { output: "plainText" }
): string;

// 4. Handles a generic YextEntityField
export function resolveComponentData<T>(
  data: YextEntityField<T>,
  locale: string,
  streamDocument?: Record<string, any>
): T | undefined;

// --- Implementation ---
export function resolveComponentData<T>(
  data:
    | YextEntityField<T>
    | TranslatableString
    | TranslatableRichText
    | undefined,
  locale: string,
  streamDocument?: Record<string, any>,
  options?: ResolveComponentDataOptions
): any {
  const rawValue = resolveRawValue(data, locale, streamDocument);
  if (options?.output === "plainText") {
    const plainTextResolved = resolveTranslatableTypeToPlainText(
      rawValue,
      locale
    );
    return toPlainTextString(plainTextResolved);
  }

  // Fully resolve the resulting value, converting any translatable
  // objects into their final string or React element form.
  const resolved = resolveTranslatableType(rawValue, locale);

  // If the resolved value is a RTF react element, wrap it in a div with tailwind classes
  if (React.isValidElement(resolved)) {
    let rtfClass = "rtf-theme rtf-light-background";
    if (options?.isDarkBackground) {
      rtfClass = "rtf-theme rtf-dark-background";
    }
    if (options?.variant && options.variant !== "base") {
      rtfClass += ` rtf-body-${options.variant}`;
    }
    if (options?.className) {
      rtfClass += ` ${options.className}`;
    }

    return <div className={rtfClass}>{resolved}</div>;
  }

  return resolved;
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

  // Handle a direct RichText object that is not inside a Translatable object.
  if (isRichText(value)) {
    return toStringOrElement(value);
  }

  // Handle TranslatableString
  if (value.hasLocalizedValue === "true" && typeof value[locale] === "string") {
    return value[locale];
  }

  // Handle TranslatableRichText
  if (value.hasLocalizedValue === "true" && isRichText(value[locale])) {
    return toStringOrElement(value[locale]);
  }

  // Handle missing translation
  if (value.hasLocalizedValue === "true" && !value[locale]) {
    return "";
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

const resolveTranslatableTypeToPlainText = (
  value: any,
  locale: string
): any | string => {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (isRichText(value)) {
    return richTextToPlainText(value);
  }

  if (
    value.hasLocalizedValue === "true" &&
    (typeof value[locale] === "string" || isRichText(value[locale]))
  ) {
    return getLocalizedPlainText(value, locale);
  }

  if (value.hasLocalizedValue === "true" && !value[locale]) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveTranslatableTypeToPlainText(item, locale)
    );
  }

  const newValue: { [key: string]: any } = {};
  for (const key in value) {
    newValue[key] = resolveTranslatableTypeToPlainText(value[key], locale);
  }
  return newValue;
};

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
  return rtf.html || "";
}

/**
 * Converts a "string | RichText" type to "string | React.ReactElement" which can be viewed on the page
 * @param value
 */
function toStringOrElement(
  value: string | RichText
): string | React.ReactElement {
  if (isRichText(value)) {
    if (value.html?.trim() === "") {
      return "";
    }
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

function resolveRawValue<T>(
  data:
    | YextEntityField<T>
    | TranslatableString
    | TranslatableRichText
    | undefined,
  locale: string,
  streamDocument?: Record<string, any>
) {
  if (data === undefined || data === null) {
    return undefined;
  }

  // If a document is provided, we can attempt full resolution.
  if (streamDocument) {
    if (isYextEntityField(data)) {
      return resolveYextEntityField(streamDocument, data, locale);
    }

    // It's a direct TranslatableString or TranslatableRichText.
    return resolveEmbeddedFieldsRecursively(data, streamDocument, locale);
  }

  // No document, so we can't resolve entity fields or embedded fields.
  // If it's a YextEntityField, we can only use its constant value.
  return isYextEntityField(data) ? data.constantValue : data;
}

function toPlainTextString(value: any): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}
