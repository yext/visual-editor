const IMPERIAL_DISTANCE_LOCALES = ["en", "en-GB"];

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
  return miles * 1.609344;
};
