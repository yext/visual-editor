import {
  ProductPrice,
  TranslatableRichText,
  TranslatableString,
} from "../types/types.ts";
import { resolveComponentData } from "./resolveComponentData.tsx";

const isProductPrice = (value: unknown): value is ProductPrice => {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "currencyCode" in value
  );
};

const normalizePriceValue = (
  value: ProductPrice["value"]
): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export const formatCurrency = (
  value: ProductPrice["value"],
  currencyCode: ProductPrice["currencyCode"],
  locale: string
): string | undefined => {
  const normalizedValue = normalizePriceValue(value);
  if (normalizedValue === undefined || !currencyCode) {
    return undefined;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(normalizedValue);
  } catch {
    const fallbackValue = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 20,
    }).format(normalizedValue);

    return `${fallbackValue} ${currencyCode}`;
  }
};

export const formatProductPrice = (
  price: ProductPrice | TranslatableString | TranslatableRichText | undefined,
  locale: string,
  streamDocument?: Record<string, any>
): string | undefined => {
  if (price === undefined || price === null) {
    return undefined;
  }

  if (isProductPrice(price)) {
    return formatCurrency(price.value, price.currencyCode, locale);
  }

  const resolvedPrice = resolveComponentData(price, locale, streamDocument, {
    output: "plainText",
  });

  return resolvedPrice || undefined;
};
