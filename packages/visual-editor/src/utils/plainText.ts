import {
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../types/types.ts";

export const isRichText = (value: unknown): value is RichText => {
  return typeof value === "object" && value !== null && "html" in value;
};

/** Replaces HTML encoded values with their unicode equivalents */
const decodeHtmlEntities = (value: string): string => {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&copy;/gi, "\u00a9")
    .replace(/&reg;/gi, "\u00ae")
    .replace(/&trade;/gi, "\u2122")
    .replace(/&ndash;/gi, "\u2013")
    .replace(/&mdash;/gi, "\u2014")
    .replace(/&hellip;/gi, "\u2026")
    .replace(/&lsquo;/gi, "\u2018")
    .replace(/&rsquo;/gi, "\u2019")
    .replace(/&ldquo;/gi, "\u201c")
    .replace(/&rdquo;/gi, "\u201d");
};

export const richTextHtmlToPlainText = (html?: string): string => {
  if (!html) {
    return "";
  }

  const withLineBreaks = html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<\/\s*div\s*>/gi, "\n")
    .replace(/<\/\s*li\s*>/gi, "\n");
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, "");
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const richTextToPlainText = (
  value: string | RichText | undefined
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return richTextHtmlToPlainText(value.html);
};

export const translatableToPlainText = (
  value: TranslatableString | TranslatableRichText | undefined
): TranslatableString | undefined => {
  if (value === undefined || value === null) {
    return value as undefined;
  }

  if (typeof value === "string" || isRichText(value)) {
    return richTextToPlainText(value);
  }

  const localizedValues = Object.entries(value).reduce(
    (acc, [key, localizedValue]) => {
      if (key === "hasLocalizedValue") {
        acc.hasLocalizedValue = "true";
        return acc;
      }

      if (
        typeof localizedValue === "string" ||
        isRichText(localizedValue) ||
        localizedValue === undefined ||
        localizedValue === null
      ) {
        acc[key] = richTextToPlainText(localizedValue ?? "");
      }

      return acc;
    },
    {} as Record<string, string>
  );

  if ("hasLocalizedValue" in value) {
    localizedValues.hasLocalizedValue = "true";
  }

  return localizedValues as TranslatableString;
};

export const getLocalizedPlainText = (
  value:
    | TranslatableString
    | TranslatableRichText
    | string
    | RichText
    | undefined,
  locale: string
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" || isRichText(value)) {
    return richTextToPlainText(value);
  }

  const localeValue = value[locale];
  return richTextToPlainText(localeValue as string | RichText | undefined);
};
