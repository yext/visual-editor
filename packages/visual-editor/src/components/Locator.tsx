import {
  AutoField,
  ComponentConfig,
  FieldLabel,
  Fields,
  setDeep,
  WithPuckProps,
} from "@puckeditor/core";
import {
  FieldValueFilter,
  FieldValueStaticFilter,
  FilterSearchResponse,
  Matcher,
  NearFilterValue,
  provideHeadless,
  Result,
  SearchHeadlessProvider,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
} from "@yext/search-headless-react";
import {
  AnalyticsProvider,
  AppliedFilters,
  CardProps,
  executeSearch,
  Facets,
  FilterSearch,
  getUserLocation,
  MapboxMap,
  OnDragHandler,
  OnSelectParams,
  Pagination,
  PinComponentProps,
  SearchI18nextProvider,
  VerticalResults,
  useAnalytics as useSearchAnalytics,
} from "@yext/search-ui-react";
import mapboxgl, { LngLat, LngLatBounds, MarkerOptions } from "mapbox-gl";
import React, { useEffect } from "react";
import { useCollapse } from "react-collapsed";
import { useTranslation } from "react-i18next";
import {
  FaChevronUp,
  FaDotCircle,
  FaRegCircle,
  FaSlidersH,
  FaTimes,
} from "react-icons/fa";
import { BasicSelector } from "../editor/BasicSelector.tsx";
import {
  DynamicOption,
  DynamicOptionsSelectorType,
} from "../editor/DynamicOptionsSelector.tsx";
import { YextField } from "../editor/YextField.tsx";
import { useDocument } from "../hooks/useDocument.tsx";
import { Button } from "../internal/puck/ui/button.tsx";
import { TranslatableString } from "../types/types.ts";
import {
  getPreferredDistanceUnit,
  toMeters,
  toMiles,
} from "../utils/i18n/distance.ts";
import { msg, pt } from "../utils/i18n/platform.ts";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import {
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
} from "../utils/searchHeadlessConfig.ts";
import {
  BackgroundStyle,
  backgroundColors,
} from "../utils/themeConfigOptions.ts";
import { StreamDocument } from "../utils/types/StreamDocument.ts";
import { getLocatorSourcePageSetsEntityTypes } from "../utils/locator.ts";
import { getValueFromQueryString } from "../utils/urlQueryString.tsx";
import { Body } from "./atoms/body.tsx";
import { Heading } from "./atoms/heading.tsx";
import {
  DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  Location,
  LocatorResultCard,
  LocatorResultCardFields,
  LocatorResultCardProps,
} from "./LocatorResultCard.tsx";
import { MapPinIcon } from "./MapPinIcon.js";
import { useAnalytics } from "@yext/pages-components";

const RESULTS_LIMIT = 20;
const LOCATION_FIELD = "builtin.location";
const COUNTRY_CODE_FIELD = "address.countryCode";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER: [number, number] = [-74.005371, 40.741611]; // New York City ([lng, lat])
const DEFAULT_RADIUS = 25;
const HOURS_FIELD = "builtin.hours";
const INITIAL_LOCATION_KEY = "initialLocation";
const DEFAULT_TITLE = "Find a Location";
const DEFAULT_LOCATION_STYLE = {
  pinIcon: { type: "none" as const },
  pinColor: backgroundColors.background6.value,
};

const translateDistanceUnit = (
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
  "../../node_modules/@mapbox/maki/icons/*.svg",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

const makiIconEntries = Object.entries(makiIconModules).map(([path, icon]) => {
  const name = path.split("/").pop()?.replace(".svg", "") || path;
  return [name, icon] as const;
});

const makiIconMap: Record<string, string> = Object.fromEntries(makiIconEntries);

const formatMakiIconLabel = (name: string) =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const makiIconOptions = makiIconEntries.map(([name, icon]) => ({
  label: formatMakiIconLabel(name),
  value: name,
  icon,
}));

const getEntityTypeLabel = (entityType: string) => {
  switch (entityType) {
    case "restaurant":
      return pt(msg("fields.options.restaurants", "Restaurants"));
    case "healthcareFacility":
      return pt(
        msg("fields.options.healthcareFacilities", "Healthcare Facilities")
      );
    case "healthcareProfessional":
      return pt(
        msg(
          "fields.options.healthcareProfessionals",
          "Healthcare Professionals"
        )
      );
    case "hotel":
      return pt(msg("fields.options.hotels", "Hotels"));
    case "financialProfessional":
      return pt(
        msg("fields.options.financialProfessionals", "Financial Professionals")
      );
    default:
      return pt(msg("fields.options.locations", "Locations"));
  }
};

const getEntityTypeFromDocument = (
  entityDocument: StreamDocument,
  entityTypeEnvVar?: string
) => {
  if (!entityDocument._pageset && entityTypeEnvVar) {
    return entityDocument._env?.[entityTypeEnvVar] || DEFAULT_ENTITY_TYPE;
  }

  try {
    const entityType = JSON.parse(entityDocument._pageset).typeConfig
      .locatorConfig.entityType;
    return entityType || DEFAULT_ENTITY_TYPE;
  } catch {
    return DEFAULT_ENTITY_TYPE;
  }
};

const getEntityType = (entityTypeEnvVar?: string) => {
  const entityDocument: StreamDocument = useDocument();
  return getEntityTypeFromDocument(entityDocument, entityTypeEnvVar);
};

const getEntityTypesFromDocument = (
  entityDocument: StreamDocument,
  entityTypeEnvVar?: string
): string[] => {
  return (
    getLocatorSourcePageSetsEntityTypes(entityDocument) ?? [
      getEntityTypeFromDocument(entityDocument, entityTypeEnvVar),
    ]
  );
};

const ResultCardPropsField = ({
  value,
  onChange,
}: {
  value?: LocatorResultCardProps;
  onChange: (nextValue: LocatorResultCardProps) => void;
}) => {
  const streamDocument = useDocument();
  const locatorSourcePageSetsEntityTypes =
    getLocatorSourcePageSetsEntityTypes(streamDocument);
  const hidePrimaryCta = locatorSourcePageSetsEntityTypes?.length === 0;
  const resultCardFields = React.useMemo(() => {
    const baseFields = LocatorResultCardFields as {
      objectFields?: Record<string, unknown>;
    };
    if (!hidePrimaryCta || !baseFields.objectFields) {
      return LocatorResultCardFields;
    }
    const objectFields = { ...baseFields.objectFields };
    delete (objectFields as { primaryCTA?: unknown }).primaryCTA;
    return {
      ...LocatorResultCardFields,
      objectFields,
    };
  }, [hidePrimaryCta]);

  return (
    <AutoField
      field={{ ...resultCardFields, label: "" }}
      value={value ?? DEFAULT_LOCATOR_RESULT_CARD_PROPS}
      onChange={onChange}
    />
  );
};

function getFacetFieldOptions(entityType: string): DynamicOption<string>[] {
  let filterOptions: DynamicOption<string>[] = [];
  switch (entityType) {
    case "location":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        {
          label: msg("fields.options.facets.associations", "Associations"),
          value: "associations",
        },
        {
          label: msg("fields.options.facets.brands", "Brands"),
          value: "brands",
        },
        {
          label: msg("fields.options.facets.keywords", "Keywords"),
          value: "keywords",
        },
        {
          label: msg("fields.options.facets.languages", "Languages"),
          value: "languages",
        },
        {
          label: msg("fields.options.facets.paymentOptions", "Payment Options"),
          value: "paymentOptions",
        },
        {
          label: msg("fields.options.facets.products", "Products"),
          value: "products",
        },
        {
          label: msg("fields.options.facets.services", "Services"),
          value: "services",
        },
        {
          label: msg("fields.options.facets.specialties", "Specialties"),
          value: "specialities",
        },
      ];
      break;
    case "restaurant":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        {
          label: msg(
            "fields.options.facets.acceptsReservations",
            "Accepts Reservations"
          ),
          value: "acceptsReservations",
        },
        {
          label: msg("fields.options.facets.associations", "Associations"),
          value: "associations",
        },
        {
          label: msg("fields.options.facets.brands", "Brands"),
          value: "brands",
        },
        {
          label: msg("fields.options.facets.keywords", "Keywords"),
          value: "keywords",
        },
        {
          label: msg("fields.options.facets.languages", "Languages"),
          value: "languages",
        },
        {
          label: msg("fields.options.facets.mealsServed", "Meals Served"),
          value: "mealsServed",
        },
        {
          label: msg("fields.options.facets.neighborhood", "Neighborhood"),
          value: "neighborhood",
        },
        {
          label: msg("fields.options.facets.paymentOptions", "Payment Options"),
          value: "paymentOptions",
        },
        {
          label: msg(
            "fields.options.facets.pickupAndDeliveryServices",
            "Pickup and Delivery Services"
          ),
          value: "pickupAndDeliveryServices",
        },
        {
          label: msg("fields.options.facets.priceRange", "Price Range"),
          value: "priceRange",
        },
        {
          label: msg("fields.options.facets.services", "Services"),
          value: "services",
        },
        {
          label: msg("fields.options.facets.specialties", "Specialties"),
          value: "specialities",
        },
      ];
      break;
    case "healthcareFacility":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        {
          label: msg(
            "fields.options.facets.acceptingNewPatients",
            "Accepting New Patients"
          ),
          value: "acceptingNewPatients",
        },
        {
          label: msg(
            "fields.options.facets.conditionsTreated",
            "Conditions Treated"
          ),
          value: "conditionsTreated",
        },
        {
          label: msg(
            "fields.options.facets.insuranceAccepted",
            "Insurance Accepted"
          ),
          value: "insuranceAccepted",
        },
        {
          label: msg("fields.options.facets.paymentOptions", "Payment Options"),
          value: "paymentOptions",
        },
        {
          label: msg("fields.options.facets.services", "Services"),
          value: "services",
        },
      ];
      break;
    case "healthcareProfessional":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        {
          label: msg(
            "fields.options.facets.acceptingNewPatients",
            "Accepting New Patients"
          ),
          value: "acceptingNewPatients",
        },
        {
          label: msg(
            "fields.options.facets.admittingHospitals",
            "Admitting Hospitals"
          ),
          value: "admittingHospitals",
        },
        {
          label: msg("fields.options.facets.brands", "Brands"),
          value: "brands",
        },
        {
          label: msg("fields.options.facets.certifications", "Certifications"),
          value: "certifications",
        },
        {
          label: msg(
            "fields.options.facets.conditionsTreated",
            "Conditions Treated"
          ),
          value: "conditionsTreated",
        },
        {
          label: msg("fields.options.facets.degrees", "Degrees"),
          value: "degrees",
        },
        {
          label: msg("fields.options.facets.gender", "Gender"),
          value: "gender",
        },
        {
          label: msg(
            "fields.options.facets.insuranceAccepted",
            "Insurance Accepted"
          ),
          value: "insuranceAccepted",
        },
        {
          label: msg("fields.options.facets.languages", "Languages"),
          value: "languages",
        },
        {
          label: msg("fields.options.facets.neighborhood", "Neighborhood"),
          value: "neighborhood",
        },
        {
          label: msg("fields.options.facets.officeName", "Office Name"),
          value: "officeName",
        },
        {
          label: msg("fields.options.facets.services", "Services"),
          value: "services",
        },
      ];
      break;
    case "hotel":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        { label: msg("fields.options.facets.bar", "Bar"), value: "bar" },
        {
          label: msg("fields.options.facets.catsAllowed", "Cats Allowed"),
          value: "catsAllowed",
        },
        {
          label: msg("fields.options.facets.dogsAllowed", "Dogs Allowed"),
          value: "dogsAllowed",
        },
        {
          label: msg("fields.options.facets.parking", "Parking"),
          value: "parking",
        },
        { label: msg("fields.options.facets.pools", "Pools"), value: "pools" },
      ];
      break;
    case "financialProfessional":
      filterOptions = [
        {
          label: msg("fields.options.facets.city", "City"),
          value: "address.city",
        },
        {
          label: msg("fields.options.facets.postalCode", "Postal Code"),
          value: "address.postalCode",
        },
        {
          label: msg("fields.options.facets.region", "Region"),
          value: "address.region",
        },
        {
          label: msg("fields.options.facets.certifications", "Certifications"),
          value: "certifications",
        },
        {
          label: msg("fields.options.facets.interests", "Interests"),
          value: "interests",
        },
        {
          label: msg("fields.options.facets.languages", "Languages"),
          value: "languages",
        },
        {
          label: msg("fields.options.facets.services", "Services"),
          value: "services",
        },
        {
          label: msg("fields.options.facets.specialties", "Specialties"),
          value: "specialties",
        },
        {
          label: msg(
            "fields.options.facets.yearsOfExperience",
            "Years of Experience"
          ),
          value: "yearsOfExperience",
        },
      ];
      break;
    default:
      filterOptions = [];
  }
  return filterOptions.sort((a, b) => a.label.localeCompare(b.label));
}

export interface LocatorProps {
  /**
   * The visual theme for the map tiles, chosen from a predefined list of Mapbox styles.
   * @defaultValue 'mapbox://styles/mapbox/streets-v12'
   */
  mapStyle?: string;

  /**
   * Location styles per entity type.
   * The number of entries is locked to the locator entity types for the page set.
   */
  locationStyles: Array<{
    /** The entity type this style applies to. */
    entityType: string;
    /** Whether to render an icon in the pin. */
    pinIcon?: {
      type: "none" | "icon";
      /** Defaults to the first available Maki icon when type is 'icon'. */
      iconName?: string;
    };
    /** The color applied to the pin. */
    pinColor?: BackgroundStyle;
  }>;

  /**
   * Configuration for the filters available in the locator search experience.
   */
  filters: {
    /**
     * If 'true', displays a button to filter for locations that are currently open.
     * @defaultValue false
     */
    openNowButton: boolean;
    /**
     * If 'true', displays several distance options to filter searches to only locations within
     * a certain radius.
     * @defaultValue false
     */
    showDistanceOptions: boolean;
    /** Which fields are facetable in the search experience */
    facetFields?: DynamicOptionsSelectorType<string>;
  };

  /**
   * The starting location for the map.
   */
  mapStartingLocation?: {
    latitude: string;
    longitude: string;
  };
  /**
   * Configuration for the locator page heading.
   * Allows customizing the title text and its color.
   */
  pageHeading?: {
    /** The title displayed at the top of the locator page. */
    title: TranslatableString;
    /**
     * The color applied to the locator page title.
     * @defaultValue inherited from theme
     */
    color?: BackgroundStyle;
  };
  /**
   * Result card properties per entity type.
   * The number of entries is locked to the locator entity types for the page set.
   */
  resultCard: Array<{
    /** The entity type this result card applies to. */
    entityType: string;
    /** Props to customize the locator result card component. */
    props: LocatorResultCardProps;
  }>;
}

const locatorFields: Fields<LocatorProps> = {
  mapStyle: BasicSelector<LocatorProps["mapStyle"]>({
    label: msg("fields.mapStyle", "Map Style"),
    options: [
      {
        label: msg("fields.options.default", "Default"),
        value: "mapbox://styles/mapbox/streets-v12",
      },
      {
        label: msg("fields.options.satellite", "Satellite"),
        value: "mapbox://styles/mapbox/satellite-streets-v12",
      },
      {
        label: msg("fields.options.light", "Light"),
        value: "mapbox://styles/mapbox/light-v11",
      },
      {
        label: msg("fields.options.dark", "Dark"),
        value: "mapbox://styles/mapbox/dark-v11",
      },
      {
        label: msg("fields.options.navigationDay", "Navigation (Day)"),
        value: "mapbox://styles/mapbox/navigation-day-v1",
      },
      {
        label: msg("fields.options.navigationNight", "Navigation (Night)"),
        value: "mapbox://styles/mapbox/navigation-night-v1",
      },
    ],
  }),
  locationStyles: YextField<LocatorProps["locationStyles"]>(
    msg("fields.pinStyles", "Location styles"),
    {
      type: "array",
      getItemSummary: (item) => getEntityTypeLabel(item.entityType),
      arrayFields: {
        entityType: YextField(msg("fields.entityType", "Entity Type"), {
          type: "text",
          visible: false,
        }),
        pinIcon: {
          type: "custom",
          render: ({ value, onChange }) => {
            const selectedType = value?.type ?? "none";
            return (
              <div className="flex flex-col gap-3">
                <FieldLabel label={pt(msg("fields.pinIcon", "Pin Icon"))}>
                  <AutoField
                    field={BasicSelector<"none" | "icon">({
                      options: [
                        {
                          label: msg("fields.options.none", "None"),
                          value: "none",
                        },
                        {
                          label: msg("fields.options.icon", "Icon"),
                          value: "icon",
                        },
                      ],
                      disableSearch: true,
                    })}
                    value={selectedType}
                    onChange={(nextType) =>
                      onChange({
                        type: nextType,
                        iconName:
                          nextType === "icon"
                            ? makiIconOptions[0].value // default to first icon
                            : undefined,
                      })
                    }
                  />
                </FieldLabel>
                {selectedType === "icon" && (
                  <FieldLabel label={pt(msg("fields.icon", "Icon"))}>
                    <AutoField
                      field={BasicSelector<string | undefined>({
                        options: makiIconOptions,
                      })}
                      value={value?.iconName}
                      onChange={(iconName) =>
                        onChange({ type: "icon", iconName })
                      }
                    />
                  </FieldLabel>
                )}
              </div>
            );
          },
        },
        pinColor: YextField(msg("fields.pinColor", "Pin Color"), {
          type: "select",
          options: "BACKGROUND_COLOR",
        }),
      },
      defaultItemProps: {
        entityType: DEFAULT_ENTITY_TYPE,
        pinIcon: { type: "none" },
        pinColor: backgroundColors.background6.value,
      },
    }
  ),
  filters: {
    label: msg("fields.filters", "Filters"),
    type: "object",
    objectFields: {
      openNowButton: YextField(
        msg("fields.options.includeOpenNow", "Include Open Now Button"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
      showDistanceOptions: YextField(
        msg("fields.options.showDistanceOptions", "Include Distance Options"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
      facetFields: YextField<DynamicOptionsSelectorType<string>, string>(
        msg("fields.dynamicFilters", "Dynamic Filters"),
        {
          type: "dynamicSelect",
          dropdownLabel: msg("fields.field", "Field"),
          getOptions: () => {
            const entityType = getEntityType();
            return getFacetFieldOptions(entityType);
          },
          placeholderOptionLabel: msg(
            "fields.options.selectAField",
            "Select a field"
          ),
        }
      ),
    },
  },
  mapStartingLocation: YextField(
    msg("fields.options.mapStartingLocation", "Map Starting Location"),
    {
      type: "object",
      objectFields: {
        latitude: YextField(msg("fields.latitude", "Latitude"), {
          type: "text",
        }),
        longitude: YextField(msg("fields.longitude", "Longitude"), {
          type: "text",
        }),
      },
    }
  ),
  pageHeading: YextField(msg("fields.pageHeading", "Page Heading"), {
    type: "object",
    objectFields: {
      title: YextField(msg("fields.title", "Title"), {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
    },
  }),
  resultCard: YextField<LocatorProps["resultCard"]>(
    msg("fields.resultCard", "Result Card"),
    {
      type: "array",
      getItemSummary: (item) => getEntityTypeLabel(item.entityType),
      arrayFields: {
        entityType: YextField(msg("fields.entityType", "Entity Type"), {
          type: "text",
          visible: false,
        }),
        props: {
          type: "custom",
          render: ({ value, onChange }) => (
            <ResultCardPropsField value={value} onChange={onChange} />
          ),
        },
      },
      defaultItemProps: {
        entityType: DEFAULT_ENTITY_TYPE,
        props: DEFAULT_LOCATOR_RESULT_CARD_PROPS,
      },
    }
  ),
};

/**
 * Available on Locator templates.
 */
export const LocatorComponent: ComponentConfig<{ props: LocatorProps }> = {
  fields: locatorFields,
  resolveFields: (_data, params) => {
    const entityDocument = params.metadata?.streamDocument;
    const entityTypes = entityDocument
      ? getEntityTypesFromDocument(
          entityDocument,
          params.metadata?.entityTypeEnvVar
        )
      : [DEFAULT_ENTITY_TYPE];
    const entityTypeCount = entityTypes.length;

    let fields = locatorFields;
    fields = setDeep(fields, "locationStyles.min", entityTypeCount);
    fields = setDeep(fields, "locationStyles.max", entityTypeCount);
    fields = setDeep(fields, "resultCard.min", entityTypeCount);
    fields = setDeep(fields, "resultCard.max", entityTypeCount);
    return fields;
  },
  defaultProps: {
    locationStyles: [],
    resultCard: [],
    filters: {
      openNowButton: false,
      showDistanceOptions: false,
    },
    pageHeading: {
      title: {
        en: DEFAULT_TITLE,
        hasLocalizedValue: "true",
      },
    },
  },
  label: msg("components.locator", "Locator"),
  /**
   * Normalizes `props.locationStyles` and `props.resultCard` to align with the
   * current locator entity types. If no styles or cards are set, defaults are
   * generated; otherwise, existing values are preserved unless the set of entity
   * types changes, in which case values are re-keyed by `entityType` and filled
   * with defaults as needed.
   */
  resolveData: (data, params) => {
    const entityDocument = params.metadata?.streamDocument;
    const entityTypes = entityDocument
      ? getEntityTypesFromDocument(
          entityDocument,
          params.metadata?.entityTypeEnvVar
        )
      : [DEFAULT_ENTITY_TYPE];
    const previousLocationStyles = data.props.locationStyles;
    if (!previousLocationStyles || previousLocationStyles.length === 0) {
      const newLocationStyles = entityTypes.map((entityType) => ({
        ...DEFAULT_LOCATION_STYLE,
        entityType,
      }));
      data = setDeep(data, "props.locationStyles", newLocationStyles);
    }

    const previousResultCards = data.props.resultCard as
      | LocatorProps["resultCard"]
      | LocatorResultCardProps;
    const legacyResultCardProps = Array.isArray(previousResultCards)
      ? undefined
      : previousResultCards;
    const previousResultCardsArray = Array.isArray(previousResultCards)
      ? previousResultCards
      : undefined;

    if (!previousResultCardsArray || previousResultCardsArray.length === 0) {
      const newResultCards = entityTypes.map((entityType) => ({
        entityType,
        props: legacyResultCardProps ?? DEFAULT_LOCATOR_RESULT_CARD_PROPS,
      }));
      data = setDeep(data, "props.resultCard", newResultCards);
    }

    const previousEntityTypes = (previousLocationStyles ?? []).map(
      (item) => item.entityType
    );
    const hasNetChange =
      previousEntityTypes.length > 0 &&
      (previousEntityTypes.length !== entityTypes.length ||
        !entityTypes.every((entityType) =>
          previousEntityTypes.includes(entityType)
        ));

    if (hasNetChange) {
      const locationStylesByEntityType = new globalThis.Map(
        (previousLocationStyles ?? []).map(
          (item) => [item.entityType, item] as const
        )
      );
      const resultCardsByEntityType = new globalThis.Map(
        (previousResultCardsArray ?? []).map(
          (item) => [item.entityType, item] as const
        )
      );

      const newLocationStyles = entityTypes.map((entityType) => {
        const existing = locationStylesByEntityType.get(entityType);
        return {
          ...DEFAULT_LOCATION_STYLE,
          ...existing,
          entityType,
        };
      });
      const newResultCards = entityTypes.map((entityType) => {
        const existing = resultCardsByEntityType.get(entityType);
        return {
          entityType,
          props:
            existing?.props ??
            legacyResultCardProps ??
            DEFAULT_LOCATOR_RESULT_CARD_PROPS,
        };
      });

      data = setDeep(data, "props.locationStyles", newLocationStyles);
      data = setDeep(data, "props.resultCard", newResultCards);
    }

    return data;
  },
  render: (props) => <LocatorWrapper {...props} />,
};

const LocatorWrapper = (props: WithPuckProps<LocatorProps>) => {
  const streamDocument = useDocument();
  const { searchAnalyticsConfig, searcher } = React.useMemo(() => {
    const searchHeadlessConfig = createSearchHeadlessConfig(
      streamDocument,
      props.puck.metadata?.experienceKeyEnvVar
    );
    if (searchHeadlessConfig === undefined) {
      return { searchAnalyticsConfig: undefined, searcher: undefined };
    }

    const searchAnalyticsConfig = createSearchAnalyticsConfig(streamDocument);
    return {
      searchAnalyticsConfig,
      searcher: provideHeadless(searchHeadlessConfig),
    };
  }, [streamDocument.id, streamDocument.locale]);

  if (searcher === undefined || searchAnalyticsConfig === undefined) {
    console.warn(
      "Could not create Locator component because Search Headless or Search Analytics config is undefined. Please check your environment variables."
    );
    return <></>;
  }
  searcher.setSessionTrackingEnabled(true);
  return (
    <SearchHeadlessProvider searcher={searcher}>
      <SearchI18nextProvider searcher={searcher}>
        <AnalyticsProvider {...searchAnalyticsConfig}>
          <LocatorInternal {...props} />
        </AnalyticsProvider>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

type SearchState = "not started" | "loading" | "complete";

const LocatorInternal = ({
  mapStyle,
  locationStyles,
  filters: { openNowButton, showDistanceOptions, facetFields },
  mapStartingLocation,
  resultCard: resultCardConfigs,
  puck,
  pageHeading,
}: WithPuckProps<LocatorProps>) => {
  // Adds a unified enableYextAnalytics to the window for both Pages and Search
  // analytics. Typically used during consent banner implementation.
  const searchAnalytics = useSearchAnalytics();
  const pagesAnalytics = useAnalytics();
  useEffect(() => {
    (window as any).enableYextAnalytics = () => {
      searchAnalytics?.optIn();
      pagesAnalytics?.optIn();
    };

    return () => {
      delete (window as any).enableYextAnalytics;
    };
  }, [searchAnalytics, pagesAnalytics]);

  const { t, i18n } = useTranslation();
  const preferredUnit = getPreferredDistanceUnit(i18n.language);
  const entityType = getEntityType(puck.metadata?.entityTypeEnvVar);
  const streamDocument = useDocument();
  const entityTypes = getEntityTypesFromDocument(
    streamDocument,
    puck.metadata?.entityTypeEnvVar
  );
  const resultCount = useSearchState(
    (state) => state.vertical.resultsCount || 0
  );
  const queryParamString =
    typeof window === "undefined" ? "" : window.location.search;
  const initialLocationParam = getValueFromQueryString(
    INITIAL_LOCATION_KEY,
    queryParamString
  );

  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement);

  let mapboxApiKey = streamDocument._env?.YEXT_MAPBOX_API_KEY;
  if (
    iframe?.contentDocument &&
    streamDocument._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
  ) {
    // If we are in the layout editor, use the non-URL-restricted Mapbox API key
    mapboxApiKey = streamDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  }

  const [showSearchAreaButton, setShowSearchAreaButton] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState<LngLat | undefined>();
  const [mapBounds, setMapBounds] = React.useState<LngLatBounds | undefined>();
  /** Explicit filter radius selected by the user, in meters */
  const [selectedDistanceMeters, setSelectedDistanceMeters] = React.useState<
    number | null
  >(null);
  const [selectedDistanceOption, setSelectedDistanceOption] = React.useState<
    number | null
  >(null);
  /** Radius of last location near filter returned by the filter search API */
  const apiFilterRadius = React.useRef<number | null>(null);

  const handleDrag: OnDragHandler = (center: LngLat, bounds: LngLatBounds) => {
    setMapCenter(center);
    setMapBounds(bounds);
    setShowSearchAreaButton(true);
  };

  const [isOpenNowSelected, setIsOpenNowSelected] = React.useState(false);
  const openNowFilter: SelectableStaticFilter = React.useMemo(
    () => ({
      filter: {
        kind: "fieldValue",
        fieldId: HOURS_FIELD,
        matcher: Matcher.OpenAt,
        value: "now",
      },
      selected: isOpenNowSelected,
      displayName: t("openNow", "Open Now"),
    }),
    [isOpenNowSelected]
  );

  const handleSearchAreaClick = () => {
    if (mapCenter && mapBounds) {
      searchActions.setOffset(0);
      const locationFilter: SelectableStaticFilter = {
        selected: true,
        displayName: "",
        filter: {
          kind: "fieldValue",
          fieldId: "builtin.location",
          value: {
            lat: mapCenter.lat,
            lng: mapCenter.lng,
            radius: mapBounds.getNorthEast().distanceTo(mapCenter),
            name: t("customSearchArea", "Custom Search Area"),
          },
          matcher: Matcher.Near,
        },
      };
      searchActions.setStaticFilters([locationFilter, openNowFilter]);
      searchActions.executeVerticalQuery();
      setSearchState("loading");
      setShowSearchAreaButton(false);
    }
  };

  const searchActions = useSearchActions();
  const selectedFacets: string[] = React.useMemo(
    () =>
      facetFields?.selections
        ?.filter((selection) => selection.value !== undefined)
        ?.map((selection) => selection.value as string) ?? [],
    [facetFields]
  );
  React.useEffect(() => {
    searchActions.setFacetAllowList(selectedFacets);
  }, [searchActions, selectedFacets]);

  const filterDisplayName = useSearchState(
    (state) =>
      state.filters?.static?.find(
        (filter) =>
          filter.filter.kind === "fieldValue" &&
          (filter.filter.fieldId === LOCATION_FIELD ||
            filter.filter.fieldId === COUNTRY_CODE_FIELD)
      )?.displayName
  );
  const handleFilterSelect = (params: OnSelectParams) => {
    const newDisplayName = params.newDisplayName;
    const filter = params.newFilter;

    let locationFilter: SelectableStaticFilter;
    let nearFilterValue: NearFilterValue | undefined;
    switch (filter.matcher) {
      case Matcher.Near: {
        nearFilterValue = filter.value as NearFilterValue;
        apiFilterRadius.current = nearFilterValue.radius;
        // only overwrite radius from filter if display options are enabled
        const radius =
          showDistanceOptions && selectedDistanceMeters
            ? selectedDistanceMeters
            : nearFilterValue.radius;
        locationFilter = buildNearLocationFilterFromPrevious(
          nearFilterValue,
          newDisplayName,
          radius
        );
        break;
      }
      case Matcher.Equals: {
        apiFilterRadius.current = null;
        locationFilter = buildEqualsLocationFilter(filter, newDisplayName);
        break;
      }
      default: {
        throw new Error(`Unsupported matcher type: ${filter.matcher}`);
      }
    }

    searchActions.setOffset(0);
    searchActions.setStaticFilters([locationFilter, openNowFilter]);
    searchActions.executeVerticalQuery();
    setSearchState("loading");
    if (
      nearFilterValue?.lat &&
      nearFilterValue?.lng &&
      areValidCoordinates(nearFilterValue.lat, nearFilterValue.lng)
    ) {
      setMapCenter(
        new mapboxgl.LngLat(nearFilterValue.lng, nearFilterValue.lat)
      );
    }
  };

  const searchLoading = useSearchState((state) => state.searchStatus.isLoading);

  const [searchState, setSearchState] =
    React.useState<SearchState>("not started");

  React.useEffect(() => {
    if (!searchLoading && searchState === "loading") {
      setSearchState("complete");
    }
  }, [searchLoading, searchState]);

  React.useEffect(() => {
    if (selectedDistanceOption === null) {
      setSelectedDistanceMeters(null);
      return;
    }
    setSelectedDistanceMeters(toMeters(selectedDistanceOption, preferredUnit));
  }, [preferredUnit, selectedDistanceOption]);

  const resultsRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const resultsContainer = React.useRef<HTMLDivElement>(null);
  // Tracks the selected pin index to highlight the corresponding result card.
  const [selectedResultIndex, setSelectedResultIndex] = React.useState<
    number | null
  >(null);

  const setResultsRef = React.useCallback((index: number) => {
    if (!resultsRef?.current) return null;
    return (result: HTMLDivElement) => (resultsRef.current[index] = result);
  }, []);

  const scrollToResult = React.useCallback(
    (result: Result | undefined) => {
      if (result) {
        if (typeof result.index === "number") {
          setSelectedResultIndex(result.index);
        }
        let scrollPos = 0;
        // the search results that are listed above this result
        const previousResultsRef = resultsRef.current.filter(
          (r, index) => r && result.index && index < result.index
        );

        // sum up the height of all search results that are listed above this result
        if (previousResultsRef.length > 0) {
          scrollPos = previousResultsRef
            .map((elem) => elem?.scrollHeight ?? 0)
            .reduce((total, height) => total + height);
        }

        resultsContainer.current?.scroll({
          top: scrollPos,
          behavior: "smooth",
        });
      } else {
        setSelectedResultIndex(null);
      }
    },
    [resultsContainer]
  );

  const markerOptionsOverride = React.useCallback((selected: boolean) => {
    return {
      offset: new mapboxgl.Point(0, selected ? -21 : -14),
    } as MarkerOptions;
  }, []);

  const resultCardConfigsArray = React.useMemo(() => {
    if (Array.isArray(resultCardConfigs)) {
      return resultCardConfigs;
    }
    if (resultCardConfigs) {
      return [
        {
          entityType: entityTypes[0] ?? DEFAULT_ENTITY_TYPE,
          props: resultCardConfigs,
        },
      ];
    }
    return [];
  }, [entityTypes, resultCardConfigs]);

  const resultCardPropsByEntityType = React.useMemo(() => {
    return resultCardConfigsArray.reduce<
      Record<string, LocatorResultCardProps>
    >((acc, item) => {
      acc[item.entityType] = item.props;
      return acc;
    }, {});
  }, [resultCardConfigsArray]);

  const getResultCardProps = React.useCallback(
    (entityType?: string) => {
      if (entityType && resultCardPropsByEntityType[entityType]) {
        return resultCardPropsByEntityType[entityType];
      }
      if (resultCardPropsByEntityType[DEFAULT_ENTITY_TYPE]) {
        return resultCardPropsByEntityType[DEFAULT_ENTITY_TYPE];
      }
      return DEFAULT_LOCATOR_RESULT_CARD_PROPS;
    },
    [resultCardPropsByEntityType]
  );

  const CardComponent = React.useCallback(
    (result: CardProps<Location>) => (
      <LocatorResultCard
        {...result}
        resultCardProps={getResultCardProps(result.result.entityType)}
        isSelected={result.result.index === selectedResultIndex}
      />
    ),
    [getResultCardProps, selectedResultIndex]
  );

  const [userLocationRetrieved, setUserLocationRetrieved] =
    React.useState<boolean>(false);
  const locationStylesConfig = React.useMemo(() => {
    const config: Record<string, { color?: BackgroundStyle; icon?: string }> =
      {};
    (locationStyles ?? []).forEach((locationStyle) => {
      const entityType = locationStyle.entityType;
      if (!entityType) return;
      const iconValue =
        locationStyle.pinIcon?.type === "icon"
          ? locationStyle.pinIcon.iconName
          : undefined;
      config[entityType] = {
        color: locationStyle.pinColor,
        icon:
          typeof iconValue === "string" ? makiIconMap[iconValue] : undefined,
      };
    });
    return config;
  }, [locationStyles]);
  const [mapProps, setMapProps] = React.useState<MapProps>({
    mapStyle,
    onDragHandler: handleDrag,
    scrollToResult: scrollToResult,
    markerOptionsOverride: markerOptionsOverride,
    locationStyleConfig: locationStylesConfig,
  });

  React.useEffect(() => {
    setMapProps((prev) => ({
      ...prev,
      mapStyle,
      locationStyleConfig: locationStylesConfig,
    }));
  }, [mapStyle, locationStylesConfig]);

  React.useEffect(() => {
    const resolveLocationAndSearch = async () => {
      const radius =
        showDistanceOptions && selectedDistanceMeters
          ? selectedDistanceMeters
          : toMeters(DEFAULT_RADIUS, preferredUnit);
      // default location filter to NYC
      let initialLocationFilter = buildNearLocationFilterFromCoords(
        DEFAULT_MAP_CENTER[1],
        DEFAULT_MAP_CENTER[0],
        radius
      );
      const doSearch = () => {
        searchActions.setVerticalLimit(RESULTS_LIMIT);
        searchActions.setOffset(0);
        searchActions.setStaticFilters([initialLocationFilter]);
        searchActions.executeVerticalQuery();
        setSearchState("loading");
        if (
          initialLocationFilter.filter.kind === "fieldValue" &&
          initialLocationFilter.filter.matcher === Matcher.Near
        ) {
          const filterValue = initialLocationFilter.filter
            .value as NearFilterValue;
          const centerCoords: [number, number] = [
            filterValue.lng,
            filterValue.lat,
          ];
          if (areValidCoordinates(centerCoords[1], centerCoords[0])) {
            setMapProps((prev) => ({ ...prev, centerCoords }));
            setMapCenter(mapboxgl.LngLat.convert(centerCoords));
          }
        }
      };

      const foundStartingLocationFromQueryParam = async (
        queryParam: string
      ): Promise<boolean> => {
        return searchActions
          .executeFilterSearch(queryParam, false, [
            {
              fieldApiName: LOCATION_FIELD,
              entityType: entityType,
              fetchEntities: false,
            },
          ])
          .then((response: FilterSearchResponse | undefined) => {
            const firstResult = response?.sections[0]?.results[0];
            const resultFilter = firstResult?.filter;
            if (!firstResult || !resultFilter) {
              return false;
            }

            switch (resultFilter.matcher) {
              case Matcher.Near: {
                const filterFromResult = resultFilter.value as NearFilterValue;
                initialLocationFilter = buildNearLocationFilterFromPrevious(
                  filterFromResult,
                  firstResult.value
                );
                apiFilterRadius.current = filterFromResult.radius;
                return true;
              }
              case Matcher.Equals: {
                initialLocationFilter = buildEqualsLocationFilter(
                  resultFilter,
                  firstResult.value
                );
                apiFilterRadius.current = null;
                return true;
              }
              default: {
                return false;
              }
            }
          })
          .catch((e) => {
            console.warn("Filter search for initial location failed:", e);
            return false;
          });
      };

      // 1. Check if a location could be determined from the initialLocation query parameter
      if (
        initialLocationParam &&
        (await foundStartingLocationFromQueryParam(initialLocationParam))
      ) {
        doSearch();
        return;
      }

      try {
        // 2. Try to get user location via Geolocation API
        const location = await getUserLocation();
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        setUserLocationRetrieved(true);

        // Try to reverse-geocode the coordinates to a human-readable place name using Mapbox
        let displayName: string | undefined;
        try {
          if (mapboxApiKey) {
            const lang =
              (streamDocument.locale as string) ||
              (typeof navigator !== "undefined"
                ? navigator.language
                : undefined) ||
              "en";
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxApiKey}&types=place,region,country&limit=1&language=${encodeURIComponent(
              lang
            )}`;

            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              const feature = data.features && data.features[0];
              displayName = feature?.place_name || undefined;
            }
          }
        } catch (e) {
          console.warn("Reverse geocoding failed:", e);
        } finally {
          initialLocationFilter = buildNearLocationFilterFromCoords(
            lat,
            lng,
            radius,
            displayName
          );
        }
      } catch {
        // 3. Fall back to mapStartingLocation prop
        try {
          if (mapStartingLocation?.latitude && mapStartingLocation.longitude) {
            const centerCoords = parseMapStartingLocation(mapStartingLocation);
            initialLocationFilter = buildNearLocationFilterFromCoords(
              centerCoords[1],
              centerCoords[0],
              radius
            );
          }
        } catch (e) {
          console.error(e);
        }
      } finally {
        doSearch();
      }
    };

    resolveLocationAndSearch().catch((e) =>
      console.error("Failed perform search:", e)
    );
  }, [searchActions, mapStartingLocation, initialLocationParam]);

  const handleOpenNowClick = (selected: boolean) => {
    if (selected === isOpenNowSelected) {
      // Prevents us from trying to set Open Now filter to false when it's not set
      return;
    }
    searchActions.setFilterOption({
      filter: {
        kind: "fieldValue",
        fieldId: HOURS_FIELD,
        matcher: Matcher.OpenAt,
        value: "now",
      },
      selected,
      displayName: t("openNow", "Open Now"),
    });
    setIsOpenNowSelected(selected);
    searchActions.setOffset(0);
    executeSearch(searchActions);
  };

  const searchFilters = useSearchState((state) => state.filters);
  const currentOffset = useSearchState((state) => state.vertical.offset);
  const previousOffset = React.useRef<number | undefined>(undefined);

  // Scroll to top when pagination changes
  React.useEffect(() => {
    if (
      currentOffset !== previousOffset.current &&
      previousOffset.current !== undefined
    ) {
      resultsContainer.current?.scroll({
        top: 0,
        behavior: "smooth",
      });
    }
    previousOffset.current = currentOffset;
  }, [currentOffset]);

  const handleDistanceClick = (
    distance: number,
    distanceUnit: "mile" | "kilometer"
  ) => {
    const existingFilters = searchFilters.static || [];
    let updatedFilters: SelectableStaticFilter[];
    const distanceInMeters = toMeters(distance, distanceUnit);
    if (selectedDistanceOption === distance) {
      setSelectedDistanceMeters(null);
      setSelectedDistanceOption(null);
      // revert to API radius (or default if none was found) if user clicks the same distance again
      updatedFilters = updateRadiusInNearFiltersOnLocationField(
        existingFilters,
        apiFilterRadius.current ?? toMeters(DEFAULT_RADIUS, preferredUnit)
      );
    } else {
      setSelectedDistanceOption(distance);
      updatedFilters = updateRadiusInNearFiltersOnLocationField(
        existingFilters,
        distanceInMeters
      );
    }
    searchActions.setStaticFilters(updatedFilters);
    searchActions.setOffset(0);
    executeSearch(searchActions);
  };

  const handleClearFiltersClick = () => {
    const existingFilters = searchFilters.static || [];
    // revert to API radius (or default if none was found)
    const partiallyUpdatedFilters = updateRadiusInNearFiltersOnLocationField(
      existingFilters,
      apiFilterRadius.current ?? toMeters(DEFAULT_RADIUS, preferredUnit)
    );
    const updatedFilters = deselectOpenNowFilters(partiallyUpdatedFilters);

    // Both open now and distance filters must be updated in the same setStaticFilters call to
    // avoid problems due to the asynchronous nature of state updates.
    searchActions.setStaticFilters(updatedFilters);
    searchActions.resetFacets();
    // Execute search to update AppliedFilters components
    searchActions.setOffset(0);
    executeSearch(searchActions);
    setSelectedDistanceMeters(null);
    setSelectedDistanceOption(null);
  };

  // If something else causes the filters to update, check if the hours filter is still present
  // and toggle off the Open Now toggle if not.
  React.useEffect(() => {
    setIsOpenNowSelected(
      searchFilters.static
        ? !!searchFilters.static.find((staticFilter) => {
            return (
              staticFilter.filter.kind === "fieldValue" &&
              staticFilter.filter.fieldId === HOURS_FIELD &&
              staticFilter.selected === true
            );
          })
        : false
    );
  }, [searchFilters]);

  const hasFacetOptions =
    (
      useSearchState((state) =>
        state.filters.facets?.filter((f) => f.options.length)
      ) ?? []
    ).length > 0;
  const hasFilterModalToggle =
    openNowButton || showDistanceOptions || hasFacetOptions;
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const resolvedHeading =
    (pageHeading?.title &&
      resolveComponentData(pageHeading.title, i18n.language, streamDocument)) ||
    t("findALocation", "Find a Location");

  const requireMapOptIn: boolean = streamDocument.__?.visualEditorConfig
    ? JSON.parse(streamDocument.__?.visualEditorConfig)?.requireMapOptIn
    : false;
  // If no opt-in is required, the map is already enabled.
  const [mapEnabled, setMapEnabled] = React.useState(!requireMapOptIn);

  return (
    <div className="components flex h-screen w-screen mx-auto">
      {/* Left Section: FilterSearch + Results. Full width for small screens */}
      <div
        className="relative h-screen w-full md:w-2/5 lg:w-[40rem] flex flex-col md:min-w-[24rem]"
        id="locatorLeftDiv"
      >
        <div className="px-8 py-6 gap-4 flex flex-col">
          <Heading level={1} color={pageHeading?.color}>
            {resolvedHeading}
          </Heading>
          <FilterSearch
            searchFields={[
              { fieldApiName: LOCATION_FIELD, entityType: entityType },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
            placeholder={t("searchHere", "Search here...")}
            ariaLabel={t("searchDropdownHere", "Search Dropdown Input")}
            customCssClasses={{
              filterSearchContainer: "font-body-fontFamily",
              focusedOption: "bg-gray-200 hover:bg-gray-200 block",
              option: "hover:bg-gray-100 px-4 py-3",
              inputElement:
                "rounded-md p-4 h-11 font-body-fontFamily font-body-fontWeight text-body-fontSize",
              currentLocationButton:
                "h-7 w-7 font-body-fontFamily font-body-fontWeight text-body-fontSize text-palette-primary-dark",
              label:
                "font-body-fontFamily font-body-fontWeight text-body-fontSize text-palette-primary-dark",
            }}
            showCurrentLocationButton={userLocationRetrieved}
            geolocationProps={{
              radius:
                preferredUnit === "mile"
                  ? DEFAULT_RADIUS
                  : toMiles(DEFAULT_RADIUS), // this component uses miles, not meters
            }}
          />
        </div>
        <div className="relative flex-1 flex flex-col min-h-0">
          <div className="px-8 py-4 text-body-fontSize border-y border-gray-300 inline-block">
            <div className="flex flex-row justify-between" id="levelWithModal">
              <ResultsCountSummary
                searchState={searchState}
                resultCount={resultCount}
                selectedDistanceOption={selectedDistanceOption}
                filterDisplayName={filterDisplayName}
              />
              {hasFilterModalToggle && (
                <button
                  className="inline-flex justify-between items-center gap-2 bg-white text-palette-primary-dark font-bold font-body-fontFamily text-body-sm-fontSize"
                  onClick={() => setShowFilterModal((prev) => !prev)}
                >
                  {t("filter", "Filter")}
                  {<FaSlidersH />}
                </button>
              )}
            </div>
            <div className="flex flex-row justify-between">
              <AppliedFilters
                hiddenFields={[LOCATION_FIELD, COUNTRY_CODE_FIELD]}
                customCssClasses={{
                  removableFilter:
                    "text-md font-normal mt-2 mb-0 font-body-fontFamily",
                  clearAllButton: "hidden",
                  appliedFiltersContainer: "mt-0 mb-0",
                }}
              />
            </div>
          </div>
          <div id="innerDiv" className="overflow-y-auto" ref={resultsContainer}>
            {resultCount > 0 && (
              <VerticalResults
                CardComponent={CardComponent}
                setResultsRef={setResultsRef}
              />
            )}
          </div>
          {resultCount > RESULTS_LIMIT && (
            <div className="border-t border-gray-300 pt-4">
              <Pagination
                customCssClasses={{
                  selectedLabel:
                    "bg-palette-primary text-palette-primary-contrast border-palette-primary",
                }}
              />
            </div>
          )}
          <FilterModal
            showFilterModal={showFilterModal}
            showOpenNowOption={openNowButton}
            isOpenNowSelected={isOpenNowSelected}
            handleOpenNowClick={handleOpenNowClick}
            showDistanceOptions={showDistanceOptions}
            selectedDistanceOption={selectedDistanceOption}
            handleDistanceClick={handleDistanceClick}
            handleCloseModalClick={() => setShowFilterModal(false)}
            handleClearFiltersClick={handleClearFiltersClick}
          />
        </div>
      </div>

      {/* Right Section: Map. Hidden for small screens */}
      <div id="locatorMapDiv" className="md:flex-1 md:flex hidden relative">
        {mapEnabled && <Map {...mapProps} />}
        {!mapEnabled && (
          <div className="flex items-center justify-center w-full h-full bg-gray-100">
            <div className="p-6">
              <Body
                className="text-gray-700 font-bold text-center"
                variant="lg"
              >
                {t(
                  "mapRequiresOptIn",
                  "This map can only be displayed if cookies are enabled"
                )}
              </Body>
              <div className="flex justify-center p-2">
                <Button
                  onClick={() => setMapEnabled(true)}
                  className="py-2 px-4 basis-full sm:w-auto justify-center"
                  variant="default"
                >
                  {t("enableCookies", "Enable Cookies")}
                </Button>
              </div>
            </div>
          </div>
        )}
        {showSearchAreaButton && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <Button
              onClick={handleSearchAreaClick}
              className="py-2 px-4 shadow-xl"
            >
              <Body>{t("searchThisArea", "Search This Area")}</Body>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResultsCountSummaryProps {
  searchState: SearchState;
  resultCount: number;
  selectedDistanceOption: number | null;
  filterDisplayName?: string;
}

const ResultsCountSummary = (props: ResultsCountSummaryProps) => {
  const {
    searchState,
    resultCount,
    selectedDistanceOption,
    filterDisplayName,
  } = props;
  const { t, i18n } = useTranslation();

  if (resultCount === 0) {
    if (searchState === "not started") {
      return (
        <Body>
          {t(
            "useOurLocatorToFindALocationNearYou",
            "Use our locator to find a location near you"
          )}
        </Body>
      );
    } else if (searchState === "complete") {
      return (
        <Body>
          {t("noResultsFoundForThisArea", "No results found for this area")}
        </Body>
      );
    } else {
      return <div />;
    }
  } else {
    if (filterDisplayName) {
      if (selectedDistanceOption) {
        const unit = getPreferredDistanceUnit(i18n.language);
        return (
          <Body>
            {t("locationsWithinDistanceOf", {
              count: resultCount,
              distance: selectedDistanceOption,
              unit: translateDistanceUnit(t, unit, selectedDistanceOption),
              name: filterDisplayName,
            })}
          </Body>
        );
      } else {
        return (
          <Body>
            {t("locationsNear", {
              count: resultCount,
              name: filterDisplayName,
            })}
          </Body>
        );
      }
    } else {
      return (
        <Body>
          {t("locationWithCount", {
            count: resultCount,
          })}
        </Body>
      );
    }
  }
};

interface MapProps {
  mapStyle?: string;
  centerCoords?: [number, number];
  onDragHandler?: OnDragHandler;
  scrollToResult?: (result: Result | undefined) => void;
  markerOptionsOverride?: (selected: boolean) => MarkerOptions;
  locationStyleConfig?: Record<
    string,
    { color?: BackgroundStyle; icon?: string }
  >;
}

const Map: React.FC<MapProps> = ({
  mapStyle,
  centerCoords,
  onDragHandler,
  scrollToResult,
  markerOptionsOverride,
  locationStyleConfig,
}) => {
  const { t } = useTranslation();
  const entityDocument: StreamDocument = useDocument();

  const documentIsUndefined = typeof document === "undefined";
  const iframe = documentIsUndefined
    ? undefined
    : (document.getElementById("preview-frame") as HTMLIFrameElement);

  const locatorMapDiv = documentIsUndefined
    ? null
    : ((iframe?.contentDocument || document)?.getElementById(
        "locatorMapDiv"
      ) as HTMLDivElement | null);

  const mapPadding = React.useMemo(
    () => getMapboxMapPadding(locatorMapDiv),
    [locatorMapDiv]
  );
  const mapboxOptions = React.useMemo(
    () => ({
      center: centerCoords,
      fitBoundsOptions: { padding: mapPadding },
      ...(mapStyle ? { style: mapStyle } : {}),
    }),
    [centerCoords, mapPadding, mapStyle]
  );

  // During page generation we don't exist in a browser context
  //@ts-expect-error MapboxGL is not loaded in the iframe content window
  if (iframe?.contentDocument && !iframe.contentWindow?.mapboxgl) {
    // We are in an iframe, and mapboxgl is not loaded in yet
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <Body className="text-gray-700" variant="lg">
            {t("loadingMap", "Loading Map...")}
          </Body>
        </div>
      </div>
    );
  }

  let mapboxApiKey = entityDocument._env?.YEXT_MAPBOX_API_KEY;
  if (
    iframe?.contentDocument &&
    entityDocument._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
  ) {
    // If we are in the layout editor, use the non-URL-restricted Mapbox API key
    mapboxApiKey = entityDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  }

  return (
    <MapboxMap
      mapboxAccessToken={mapboxApiKey || ""}
      mapboxOptions={mapboxOptions}
      onDrag={onDragHandler}
      PinComponent={(pinProps) => (
        <LocatorMapPin
          {...pinProps}
          locationStyleConfig={locationStyleConfig}
        />
      )}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={!!iframe?.contentDocument}
      onPinClick={scrollToResult}
      markerOptionsOverride={markerOptionsOverride}
    />
  );
};

type LocatorMapPinProps<T> = PinComponentProps<T> & {
  locationStyleConfig?: Record<
    string,
    { color?: BackgroundStyle; icon?: string }
  >;
};

const LocatorMapPin = <T,>(props: LocatorMapPinProps<T>) => {
  const { result, selected, locationStyleConfig } = props;
  const entityType = result.entityType;
  const entityLocationStyle = entityType
    ? locationStyleConfig?.[entityType]
    : undefined;

  return (
    <MapPinIcon
      color={entityLocationStyle?.color}
      resultIndex={result.index}
      icon={entityLocationStyle?.icon}
      selected={selected}
    />
  );
};

interface FilterModalProps {
  showFilterModal: boolean;
  showOpenNowOption: boolean; // whether to show the Open Now filter option
  isOpenNowSelected: boolean; // whether the Open Now filter is currently selected by the user
  showDistanceOptions: boolean; // whether to show the Distance filter option
  selectedDistanceOption: number | null;
  handleCloseModalClick: () => void;
  handleOpenNowClick: (selected: boolean) => void;
  handleDistanceClick: (
    distance: number,
    distanceUnit: "mile" | "kilometer"
  ) => void;
  handleClearFiltersClick: () => void;
}

const FilterModal = (props: FilterModalProps) => {
  const {
    showFilterModal,
    showOpenNowOption,
    isOpenNowSelected,
    showDistanceOptions,
    selectedDistanceOption,
    handleCloseModalClick,
    handleOpenNowClick,
    handleDistanceClick,
    handleClearFiltersClick,
  } = props;
  const { t } = useTranslation();
  const popupRef = React.useRef<HTMLDivElement>(null);

  return showFilterModal ? (
    <div
      id="popup"
      className="absolute md:top-4 -top-20 z-50 md:w-80 w-full flex flex-col bg-white md:left-full md:ml-2 rounded-md shadow-lg max-h-[calc(100%-2rem)]"
      ref={popupRef}
    >
      <div className="inline-flex justify-between items-center px-6 py-4 gap-4">
        <Body className="font-bold">
          {t("refineYourSearch", "Refine Your Search")}
        </Body>
        <button
          className="text-palette-primary-dark"
          onClick={handleCloseModalClick}
        >
          <FaTimes />
        </button>
      </div>
      <div className="px-6 border-b border-gray-300">
        <AppliedFilters
          hiddenFields={[LOCATION_FIELD, COUNTRY_CODE_FIELD]}
          customCssClasses={{
            removableFilter: "text-md font-normal",
            clearAllButton: "hidden",
          }}
        />
      </div>
      <div className="flex flex-col p-6 gap-6 overflow-y-auto">
        <div className="flex flex-col gap-8">
          {showOpenNowOption && (
            <OpenNowFilter
              isSelected={isOpenNowSelected}
              onChange={handleOpenNowClick}
            />
          )}
          {showDistanceOptions && (
            <DistanceFilter
              onChange={handleDistanceClick}
              selectedDistanceOption={selectedDistanceOption}
            />
          )}
          <Facets
            customCssClasses={{
              divider: "bg-white",
              titleLabel: "font-bold text-md font-body-fontFamily",
              optionInput: "h-4 w-4 accent-palette-primary-dark",
              optionLabel: "text-md font-body-fontFamily font-body-fontWeight",
              option: "space-x-4 font-body-fontFamily",
            }}
          />
        </div>
      </div>
      <div className="border-y border-gray-300 justify-center align-middle">
        <button
          className="w-full py-4 text-center text-palette-primary-dark font-bold font-body-fontFamily text-body-fontSize"
          onClick={handleClearFiltersClick}
        >
          {t("clearAll", "Clear All")}
        </button>
      </div>
    </div>
  ) : null;
};

interface OpenNowFilterProps {
  isSelected: boolean;
  onChange: (selected: boolean) => void;
}

const OpenNowFilter = (props: OpenNowFilterProps) => {
  const { isSelected, onChange } = props;
  const { t } = useTranslation();
  const { isExpanded, getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: true,
  });
  const iconClassName = isExpanded
    ? "w-3 text-gray-400"
    : "w-3 text-gray-400 transform rotate-180";

  const openNowCheckBoxId = "openNowCheckBox";
  return (
    <div className="flex flex-col gap-4">
      <button
        className="w-full flex justify-between items-center font-bold font-body-fontFamily text-body-fontSize"
        {...getToggleProps()}
      >
        {t("hours", "Hours")}
        <FaChevronUp className={iconClassName} />
      </button>
      <div className="flex flex-row gap-1" {...getCollapseProps()}>
        <div className="inline-flex items-center gap-4">
          <input
            type="checkbox"
            id={openNowCheckBoxId}
            checked={isSelected}
            className={
              "w-4 h-4 form-checkbox cursor-pointer border border-gray-300" +
              " rounded-sm text-primary focus:ring-primary accent-palette-primary-dark"
            }
            onChange={() => onChange(!isSelected)}
          />
          <label htmlFor={openNowCheckBoxId}>
            <Body>{t("openNow", "Open Now")}</Body>
          </label>
        </div>
      </div>
    </div>
  );
};

interface DistanceFilterProps {
  onChange: (distance: number, unit: "mile" | "kilometer") => void;
  selectedDistanceOption: number | null;
}

const DistanceFilter = (props: DistanceFilterProps) => {
  const { selectedDistanceOption, onChange } = props;
  const { t, i18n } = useTranslation();
  const { isExpanded, getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: true,
  });
  const iconClassName = isExpanded
    ? "w-3 text-gray-400"
    : "w-3 text-gray-400 transform rotate-180";
  const distanceOptions = [5, 10, 25, 50];
  const unit = getPreferredDistanceUnit(i18n.language);

  return (
    <div className="flex flex-col gap-4">
      <button
        className="w-full flex justify-between items-center font-bold font-body-fontFamily text-body-fontSize"
        {...getToggleProps()}
      >
        {t("distance", "Distance")}
        <FaChevronUp className={iconClassName} />
      </button>
      <div {...getCollapseProps()}>
        {distanceOptions.map((distanceOption) => (
          <div
            className="flex flex-row gap-4 items-center"
            id={`distanceOption-${distanceOption}`}
            key={distanceOption}
          >
            <button
              className="inline-flex bg-white"
              onClick={() => onChange(distanceOption, unit)}
              aria-label={`${t("selectDistanceLessThan", "Select distance less than")} ${distanceOption} ${translateDistanceUnit(t, unit, distanceOption)}`}
            >
              <div className="text-palette-primary-dark">
                {selectedDistanceOption === distanceOption ? (
                  <FaDotCircle />
                ) : (
                  <FaRegCircle />
                )}
              </div>
            </button>
            <Body className="inline-flex">
              {`< ${distanceOption} ${translateDistanceUnit(t, unit, distanceOption)}`}
            </Body>
          </div>
        ))}
      </div>
    </div>
  );
};

const getMapboxMapPadding = (divElement: HTMLDivElement | null) => {
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

const parseMapStartingLocation = (mapStartingLocation: {
  latitude: string;
  longitude: string;
}): [number, number] => {
  const lat = parseFloat(mapStartingLocation.latitude);
  const lng = parseFloat(mapStartingLocation.longitude);

  let err = [];
  if (isNaN(lat) || lat < -90 || lat > 90) {
    err.push("Latitude must be a number between -90 and 90.");
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    err.push("Longitude must be a number between -180 and 180.");
  }
  if (err.length) {
    throw new Error(err.join("\n"));
  }

  return [lng, lat];
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
function buildNearLocationFilterFromPrevious(
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
function buildNearLocationFilterFromCoords(
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
function buildEqualsLocationFilter(
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
function updateRadiusInNearFiltersOnLocationField(
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
function deselectOpenNowFilters(
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
function areValidCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
