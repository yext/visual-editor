import { getPreferredDistanceUnit } from "../../../utils/i18n/distance.ts";

export type DistanceUnit = "mile" | "kilometer";
export type DistanceUnitOption = "auto" | "locale" | DistanceUnit;

const getBrowserCountryCode = (
  browserLanguage: string | undefined
): string | undefined => {
  if (!browserLanguage) {
    return undefined;
  }

  try {
    return new Intl.Locale(browserLanguage.replaceAll("_", "-")).region;
  } catch {
    return undefined;
  }
};

export const getDistanceUnit = (
  option: DistanceUnitOption | undefined,
  visitorCountryCode: string | undefined,
  browserLanguage: string | undefined,
  pageLanguage: string
): DistanceUnit => {
  if (option === "mile" || option === "kilometer") {
    return option;
  }
  if (option === "locale" || option === undefined) {
    return getPreferredDistanceUnit(pageLanguage);
  }

  const countryCode =
    visitorCountryCode ?? getBrowserCountryCode(browserLanguage);
  if (countryCode?.toUpperCase() === "US") {
    return "mile";
  }
  if (countryCode) {
    return getPreferredDistanceUnit(`en-${countryCode.toUpperCase()}`);
  }

  return getPreferredDistanceUnit(pageLanguage);
};

export const getMapboxCountryCode = (data: {
  features?: Array<{ properties?: { short_code?: string } }>;
}): string | undefined => data.features?.[0]?.properties?.short_code;
