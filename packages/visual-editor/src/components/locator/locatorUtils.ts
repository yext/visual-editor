import {
  FieldValueFilter,
  FieldValueStaticFilter,
  Matcher,
  NearFilterValue,
  SelectableStaticFilter,
} from "@yext/search-headless-react";
import { Coordinate } from "@yext/search-ui-react";
import { ImageField } from "../../fields/ImageField.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  ThemeColor,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { LocatorConfig } from "../../utils/types/StreamDocument.ts";

export const RESULTS_LIMIT = 20;
export const LOCATION_FIELD = "builtin.location";
export const COUNTRY_CODE_FIELD = "address.countryCode";
export const DEFAULT_MAP_CENTER: Coordinate = {
  latitude: 40.741611,
  longitude: -74.005371,
}; // New York City
export const DEFAULT_RADIUS = 25;
export const HOURS_FIELD = "builtin.hours";
export const INITIAL_LOCATION_KEY = "initialLocation";
export const DEFAULT_TITLE = "Find a Location";
export const DEFAULT_DISTANCE_DISPLAY = "distanceFromUser";
export const DEFAULT_LOCATION_STYLE = {
  pinIcon: { type: "none" },
  pinColor: backgroundColors.background6.value,
};
export const DEFAULT_PIN_ICON_WIDTH = 14;
export const MAX_PIN_ICON_WIDTH = 27;
export const PIN_ICON_MAX_FILE_SIZE_BYTES = 128 * 1024;

export type LocationStyleConfig = Record<
  string,
  {
    color?: ThemeColor;
    icon?: string;
    customImage?: {
      url: string;
      width?: number;
      aspectRatio?: number;
    };
  }
>;

export const LOCATOR_PIN_ICON_FIELD: ImageField = {
  type: "image",
  label: msg("fields.icon", "Icon"),
  hideAltTextField: true,
  maxFileSizeBytes: PIN_ICON_MAX_FILE_SIZE_BYTES,
};

export const getConfiguredMapCenterOrDefault = (mapStartingLocation?: {
  latitude: string;
  longitude: string;
}): Coordinate => {
  if (mapStartingLocation?.latitude && mapStartingLocation.longitude) {
    try {
      return parseMapStartingLocation(mapStartingLocation);
    } catch (e) {
      console.error(e);
    }
  }

  return DEFAULT_MAP_CENTER;
};

export const getLocatorConfigFromPageSet = (
  pageSet?: string
): LocatorConfig => {
  if (!pageSet) {
    return {};
  }

  try {
    return JSON.parse(pageSet)?.typeConfig?.locatorConfig ?? {};
  } catch {
    console.error("Failed to parse locator config from page set");
    return {};
  }
};

export const translateDistanceUnit = (
  t: (key: string, options?: Record<string, unknown>) => string,
  unit: "mile" | "kilometer",
  count: number
) => {
  if (unit === "mile") {
    return t("mile", { count, defaultValue: "mile" });
  }

  return t("kilometer", { count, defaultValue: "kilometer" });
};

const makiIconModules = import.meta.glob(
  "../../../node_modules/@mapbox/maki/icons/*.svg",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

const makiIconEntries = Object.entries(makiIconModules).map(([path, icon]) => {
  const name = path.split("/").pop()?.replace(".svg", "") || path;
  return [name, icon] as const;
});

export const makiIconMap: Record<string, string> =
  Object.fromEntries(makiIconEntries);

const formatMakiIconLabel = (name: string) =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export const makiIconOptions = makiIconEntries.map(([name, icon]) => ({
  label: formatMakiIconLabel(name),
  value: name,
  icon,
}));

export const DEFAULT_MAKI_ICON_NAME = makiIconOptions[0]?.value;

export const getMapboxMapPadding = (divElement: HTMLDivElement | null) => {
  if (!divElement) {
    return 50;
  }

  const { width, height } = divElement.getBoundingClientRect();
  const mapVerticalPadding = Math.max(50, height * 0.2);
  const mapHorizontalPadding = Math.max(50, width * 0.2);
  return {
    top: mapVerticalPadding,
    bottom: mapVerticalPadding,
    left: mapHorizontalPadding,
    right: mapHorizontalPadding,
  };
};

export const parseMapStartingLocation = (mapStartingLocation: {
  latitude: string;
  longitude: string;
}): Coordinate => {
  const lat = parseFloat(mapStartingLocation.latitude);
  const lng = parseFloat(mapStartingLocation.longitude);

  const err: string[] = [];
  if (isNaN(lat) || lat < -90 || lat > 90) {
    err.push("Latitude must be a number between -90 and 90.");
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    err.push("Longitude must be a number between -180 and 180.");
  }
  if (err.length) {
    throw new Error(err.join("\n"));
  }

  return {
    latitude: lat,
    longitude: lng,
  };
};

/**
 * Returns true if the given filter is a "near" filter on the builtin.location field; otherwise,
 * returns false.
 */
const isLocationNearFilter = (filter: SelectableStaticFilter) =>
  filter.filter.kind === "fieldValue" &&
  filter.filter.fieldId === LOCATION_FIELD &&
  filter.filter.matcher === Matcher.Near;

/**
 * Returns true if the given filter is an "open at" filter on the builtin.hours field; otherwise,
 * returns false.
 */
const isOpenNowFilter = (filter: SelectableStaticFilter) =>
  filter.filter.kind === "fieldValue" &&
  filter.filter.fieldId === HOURS_FIELD &&
  filter.filter.matcher === Matcher.OpenAt;

/**
 * Builds a "near" static filter on the builtin.location field from a previous near filter
 * value, with optional overrides for display name and radius
 */
export function buildNearLocationFilterFromPrevious(
  previousValue: NearFilterValue,
  displayName?: string,
  radius?: number
): SelectableStaticFilter {
  return {
    selected: true,
    displayName,
    filter: {
      kind: "fieldValue",
      fieldId: LOCATION_FIELD,
      value: {
        ...previousValue,
        radius: radius ?? previousValue.radius,
      },
      matcher: Matcher.Near,
    },
  };
}

/**
 * Builds a "near" static filter on the builtin.location field from given coordinates, with
 * optional radius and display name.
 */
export function buildNearLocationFilterFromCoords(
  lat: number,
  lng: number,
  radius: number,
  displayName?: string
): SelectableStaticFilter {
  return {
    selected: true,
    displayName,
    filter: {
      kind: "fieldValue",
      fieldId: LOCATION_FIELD,
      value: {
        lat,
        lng,
        radius,
      },
      matcher: Matcher.Near,
    },
  };
}

/**
 * Builds an "equals" static filter on the builtin.location field from a previous equals filter,
 * with a new display name.
 */
export function buildEqualsLocationFilter(
  filter: FieldValueFilter,
  newDisplayName: string
): SelectableStaticFilter {
  return {
    displayName: newDisplayName,
    selected: true,
    filter: {
      kind: "fieldValue",
      fieldId: filter.fieldId,
      value: filter.value,
      matcher: Matcher.Equals,
    },
  };
}

/**
 * Helper function to iterate through a list of static filters and update all near filters on the
 * location field to have the new radius.
 */
export function updateRadiusInNearFiltersOnLocationField(
  filters: SelectableStaticFilter[],
  newRadius: number
): SelectableStaticFilter[] {
  return filters.map((filter) => {
    if (isLocationNearFilter(filter)) {
      const previousFilter = filter.filter as FieldValueStaticFilter;
      const previousValue = previousFilter.value as NearFilterValue;
      return {
        ...filter,
        filter: {
          ...previousFilter,
          value: {
            ...previousValue,
            radius: newRadius,
          },
        },
      } as SelectableStaticFilter;
    }

    return filter;
  });
}

/**
 * Helper function to iterate through a list of static filters and set the selected field to
 * false on any Open Now filters.
 */
export function deselectOpenNowFilters(
  filters: SelectableStaticFilter[]
): SelectableStaticFilter[] {
  return filters.map((filter) => {
    if (isOpenNowFilter(filter)) {
      return {
        ...filter,
        selected: false,
      };
    }

    return filter;
  });
}

/** Checks whether a given lat and lng are valid coordinates */
export function areValidCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
