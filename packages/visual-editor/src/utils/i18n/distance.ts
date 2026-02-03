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

export const toMiles = (kilometers: number) => {
  return kilometers / 1.609344;
};

export const formatDistance = (distance: number, locale: string, minDigits = 1, maxDigits = 1) => {
return new Intl.NumberFormat(locale, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: maxDigits,
          }).format(distance)
};
