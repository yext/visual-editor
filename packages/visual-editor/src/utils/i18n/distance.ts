import { getDistance } from "geolib";

const IMPERIAL_DISTANCE_LOCALES = ["en", "en-GB"];
const KILOMETERS_PER_MILE = 1.609344;
const METERS_PER_KILOMETER = 1000;
const METERS_PER_MILE = KILOMETERS_PER_MILE * METERS_PER_KILOMETER;

export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export type DistanceUnit = "mile" | "kilometer";
export type DistanceUnitSelection = DistanceUnit | "locale";

export const distanceUnitOptions = [
  { label: "Mile", value: "mile" },
  { label: "Kilometer", value: "kilometer" },
  { label: "Locale Specific", value: "locale" },
] as const;

/**
 * Returns the preferred distance unit for a given locale.
 */
export const getPreferredDistanceUnit = (locale: string) => {
  return IMPERIAL_DISTANCE_LOCALES.includes(locale) ? "mile" : "kilometer";
};

export const resolveDistanceUnit = (
  unit: DistanceUnitSelection | undefined,
  locale: string
): DistanceUnit => {
  if (unit === "mile" || unit === "kilometer") {
    return unit;
  }

  return getPreferredDistanceUnit(locale);
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

export const toMeters = (distance: number, unit: DistanceUnit) => {
  return distance * (unit === "mile" ? METERS_PER_MILE : METERS_PER_KILOMETER);
};

export const fromMeters = (meters: number, unit: DistanceUnit) => {
  return meters / (unit === "mile" ? METERS_PER_MILE : METERS_PER_KILOMETER);
};

const toCoordinate = (
  coordinate?: Partial<GeoCoordinate> | null
): GeoCoordinate | undefined => {
  if (
    typeof coordinate?.latitude !== "number" ||
    !Number.isFinite(coordinate.latitude) ||
    typeof coordinate?.longitude !== "number" ||
    !Number.isFinite(coordinate.longitude)
  ) {
    return undefined;
  }

  return {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
  };
};

export const getCoordinateDistanceInMeters = (
  origin?: Partial<GeoCoordinate> | null,
  destination?: Partial<GeoCoordinate> | null
) => {
  const resolvedOrigin = toCoordinate(origin);
  const resolvedDestination = toCoordinate(destination);

  if (!resolvedOrigin || !resolvedDestination) {
    return undefined;
  }

  return getDistance(resolvedOrigin, resolvedDestination);
};

export const getCoordinateDistance = (
  origin: Partial<GeoCoordinate> | null | undefined,
  destination: Partial<GeoCoordinate> | null | undefined,
  {
    locale = "en",
    unit = "locale",
  }: {
    locale?: string;
    unit?: DistanceUnitSelection;
  } = {}
) => {
  const distanceInMeters = getCoordinateDistanceInMeters(origin, destination);

  if (distanceInMeters === undefined) {
    return undefined;
  }

  return fromMeters(distanceInMeters, resolveDistanceUnit(unit, locale));
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
