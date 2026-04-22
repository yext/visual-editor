import { ProductPrice } from "../types/types.ts";

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

const getSafeLocale = (locale: string) => {
  try {
    return Intl.NumberFormat.supportedLocalesOf(locale)[0] || "en-US";
  } catch {
    return "en-US";
  }
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
    const safeLocale = getSafeLocale(locale);
    const fallbackValue = new Intl.NumberFormat(safeLocale, {
      maximumFractionDigits: 20,
    }).format(normalizedValue);

    return `${fallbackValue} ${currencyCode}`;
  }
};
