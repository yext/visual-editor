const IMPERIAL_DISTANCE_LOCALES = ["en", "en-GB"];
const KILOMETERS_PER_MILE = 1.609344;
const METERS_PER_KILOMETER = 1000;
const METERS_PER_MILE = KILOMETERS_PER_MILE * METERS_PER_KILOMETER;

/**
 * Returns the preferred distance unit for a given locale.
 */
export const getPreferredDistanceUnit = (locale: string) => {
  return IMPERIAL_DISTANCE_LOCALES.includes(locale) ? "mile" : "kilometer";
};

/**
 * Converts miles to kilometers.
 */
export const toKilometers = (miles: number) => {
  return miles * KILOMETERS_PER_MILE;
};

export const toMiles = (kilometers: number) => {
  return kilometers / KILOMETERS_PER_MILE;
};

export const toMeters = (distance: number, unit: "mile" | "kilometer") => {
  return distance * (unit === "mile" ? METERS_PER_MILE : METERS_PER_KILOMETER);
};

export const fromMeters = (meters: number, unit: "mile" | "kilometer") => {
  return meters / (unit === "mile" ? METERS_PER_MILE : METERS_PER_KILOMETER);
};

export const formatDistance = (
  distance: number,
  locale: string,
  minDigits = 1,
  maxDigits = 1
) => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(distance);
};
