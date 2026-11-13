export const MILE = "mile";
export const KILOMETER = "kilometer";
export const BROWSER_LANGUAGE = "browserLanguage";

export const DISTANCE_UNITS = [MILE, KILOMETER] as const;
export type DistanceUnit = (typeof DISTANCE_UNITS)[number];
export type DefaultDistanceUnit = DistanceUnit | typeof BROWSER_LANGUAGE;
