import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, WithPuckProps } from "@measured/puck";
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
  PinComponent,
  SearchI18nextProvider,
  VerticalResults,
} from "@yext/search-ui-react";
import {
  FilterSearchResponse,
  FieldValueStaticFilter,
  Matcher,
  provideHeadless,
  Result,
  NearFilterValue,
  SearchHeadlessProvider,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
  FieldValueFilter,
} from "@yext/search-headless-react";
import React from "react";
import {
  BasicSelector,
  Button,
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
  DynamicOption,
  DynamicOptionsSelectorType,
  Heading,
  Location,
  LocatorResultCard,
  LocatorResultCardProps,
  msg,
  useDocument,
  YextField,
} from "@yext/visual-editor";
import {
  DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  LocatorResultCardFields,
} from "./LocatorResultCard.tsx";
import mapboxgl, { LngLat, LngLatBounds, MarkerOptions } from "mapbox-gl";
import { MapPinIcon } from "./MapPinIcon.js";
import {
  FaChevronUp,
  FaDotCircle,
  FaRegCircle,
  FaSlidersH,
  FaTimes,
} from "react-icons/fa";
import { useCollapse } from "react-collapsed";
import { getValueFromQueryString } from "../utils/urlQueryString";

const RESULTS_LIMIT = 20;
const LOCATION_FIELD = "builtin.location";
const COUNTRY_CODE_FIELD = "address.countryCode";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER: [number, number] = [-74.005371, 40.741611]; // New York City ([lng, lat])
const DEFAULT_RADIUS_MILES = 25;
const HOURS_FIELD = "builtin.hours";
const MILES_TO_METERS = 1609.34;
const INITIAL_LOCATION_KEY = "initialLocation";

const getEntityType = (entityTypeEnvVar?: string) => {
  const entityDocument: any = useDocument();
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
   * Props to customize the locator result card component.
   * Controls which fields are displayed and their styling.
   */
  resultCard: LocatorResultCardProps;
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
  resultCard: LocatorResultCardFields,
};

/**
 * Available on Locator templates.
 */
export const LocatorComponent: ComponentConfig<{ props: LocatorProps }> = {
  fields: locatorFields,
  defaultProps: {
    filters: {
      openNowButton: false,
      showDistanceOptions: false,
    },
    resultCard: DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  },
  label: msg("components.locator", "Locator"),
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
        <AnalyticsProvider {...(searchAnalyticsConfig as any)}>
          <LocatorInternal {...props} />
        </AnalyticsProvider>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

type SearchState = "not started" | "loading" | "complete";

const LocatorInternal = ({
  mapStyle,
  filters: { openNowButton, showDistanceOptions, facetFields },
  mapStartingLocation,
  resultCard: resultCardProps,
  puck,
}: WithPuckProps<LocatorProps>) => {
  const { t } = useTranslation();
  const entityType = getEntityType(puck.metadata?.entityTypeEnvVar);
  const streamDocument = useDocument();
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
  /** Explicit filter radius selected by the user */
  const [selectedDistanceMiles, setSelectedDistanceMiles] = React.useState<
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
          showDistanceOptions && selectedDistanceMiles
            ? selectedDistanceMiles * MILES_TO_METERS
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
      nearFilterValue?.lat &&
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

  const resultsRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const resultsContainer = React.useRef<HTMLDivElement>(null);

  const setResultsRef = React.useCallback((index: number) => {
    if (!resultsRef?.current) return null;
    return (result: HTMLDivElement) => (resultsRef.current[index] = result);
  }, []);

  const scrollToResult = React.useCallback(
    (result: Result | undefined) => {
      if (result) {
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
      }
    },
    [resultsContainer]
  );

  const markerOptionsOverride = React.useCallback((selected: boolean) => {
    return {
      offset: new mapboxgl.Point(0, selected ? -21 : -14),
    } as MarkerOptions;
  }, []);

  const CardComponent = React.useCallback(
    (result: CardProps<Location>) => (
      <LocatorResultCard
        {...result}
        puck={puck}
        resultCardProps={resultCardProps}
      />
    ),
    [puck, resultCardProps]
  );

  const [userLocationRetrieved, setUserLocationRetrieved] =
    React.useState<boolean>(false);
  const [mapProps, setMapProps] = React.useState<MapProps>({
    mapStyle,
    onDragHandler: handleDrag,
    scrollToResult: scrollToResult,
    markerOptionsOverride: markerOptionsOverride,
  });

  React.useEffect(() => {
    const resolveLocationAndSearch = async () => {
      const radius =
        showDistanceOptions && selectedDistanceMiles
          ? selectedDistanceMiles * MILES_TO_METERS
          : DEFAULT_RADIUS_MILES * MILES_TO_METERS;
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
          setMapProps((prev) => ({ ...prev, centerCoords }));
          if (areValidCoordinates(centerCoords[1], centerCoords[0])) {
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

  const handleDistanceClick = (distanceMiles: number) => {
    const existingFilters = searchFilters.static || [];
    let updatedFilters: SelectableStaticFilter[];
    if (distanceMiles === selectedDistanceMiles) {
      setSelectedDistanceMiles(null);
      // revert to API radius (or default if none was found) if user clicks the same distance again
      updatedFilters = updateRadiusInNearFiltersOnLocationField(
        existingFilters,
        apiFilterRadius.current ?? DEFAULT_RADIUS_MILES * MILES_TO_METERS
      );
    } else {
      setSelectedDistanceMiles(distanceMiles);
      updatedFilters = updateRadiusInNearFiltersOnLocationField(
        existingFilters,
        distanceMiles * MILES_TO_METERS
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
      apiFilterRadius.current ?? DEFAULT_RADIUS_MILES * MILES_TO_METERS
    );
    const updatedFilters = deselectOpenNowFilters(partiallyUpdatedFilters);

    // Both open now and distance filters must be updated in the same setStaticFilters call to
    // avoid problems due to the asynchronous nature of state updates.
    searchActions.setStaticFilters(updatedFilters);
    searchActions.resetFacets();
    // Execute search to update AppliedFilters components
    searchActions.setOffset(0);
    executeSearch(searchActions);
    setSelectedDistanceMiles(null);
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

  return (
    <div className="components flex h-screen w-screen mx-auto">
      {/* Left Section: FilterSearch + Results. Full width for small screens */}
      <div
        className="relative h-screen w-full md:w-2/5 lg:w-[40rem] flex flex-col md:min-w-[24rem]"
        id="locatorLeftDiv"
      >
        <div className="px-8 py-6 gap-4 flex flex-col">
          <Heading level={3}>{t("findALocation", "Find a Location")}</Heading>
          <FilterSearch
            searchFields={[
              { fieldApiName: LOCATION_FIELD, entityType: entityType },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
            placeholder={t("searchHere", "Search here...")}
            ariaLabel={t("searchDropdownHere", "Search Dropdown Input")}
            customCssClasses={{
              focusedOption: "bg-gray-200 hover:bg-gray-200",
              option: "hover:bg-gray-100 px-4 py-3",
              inputElement: "rounded-md p-4 h-11",
              currentLocationButton: "h-7 w-7 text-palette-primary-dark",
            }}
            showCurrentLocationButton={userLocationRetrieved}
            geolocationProps={{
              radius: DEFAULT_RADIUS_MILES, // this component uses miles, not meters
            }}
          />
        </div>
        <div className="relative flex-1 flex flex-col min-h-0">
          <div className="px-8 py-4 text-body-fontSize border-y border-gray-300 inline-block">
            <div className="flex flex-row justify-between" id="levelWithModal">
              <ResultsCountSummary
                searchState={searchState}
                resultCount={resultCount}
                selectedDistanceMiles={selectedDistanceMiles}
                filterDisplayName={filterDisplayName}
              />
              {hasFilterModalToggle && (
                <button
                  className="inline-flex justify-between items-center gap-2 font-bold text-body-sm-fontSize bg-white text-palette-primary-dark"
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
                  removableFilter: "text-md font-normal mt-2 mb-0",
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
            selectedDistanceMiles={selectedDistanceMiles}
            handleDistanceClick={handleDistanceClick}
            handleCloseModalClick={() => setShowFilterModal(false)}
            handleClearFiltersClick={handleClearFiltersClick}
          />
        </div>
      </div>

      {/* Right Section: Map. Hidden for small screens */}
      <div id="locatorMapDiv" className="md:flex-1 md:flex hidden relative">
        <Map {...mapProps} />
        {showSearchAreaButton && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <Button
              onClick={handleSearchAreaClick}
              className="py-2 px-4 shadow-xl"
            >
              {t("searchThisArea", "Search This Area")}
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
  selectedDistanceMiles: number | null;
  filterDisplayName?: string;
}

const ResultsCountSummary = (props: ResultsCountSummaryProps) => {
  const { searchState, resultCount, selectedDistanceMiles, filterDisplayName } =
    props;
  const { t } = useTranslation();

  if (resultCount === 0) {
    if (searchState === "not started") {
      return (
        <div>
          {t(
            "useOurLocatorToFindALocationNearYou",
            "Use our locator to find a location near you"
          )}
        </div>
      );
    } else if (searchState === "complete") {
      return (
        <div>
          {t("noResultsFoundForThisArea", "No results found for this area")}
        </div>
      );
    } else {
      return <div></div>;
    }
  } else {
    if (filterDisplayName) {
      if (selectedDistanceMiles) {
        return (
          <div>
            {t(
              "locationsWithinDistanceOf",
              '{{count}} locations within {{distance}} miles of "{{name}}"',
              {
                count: resultCount,
                distance: selectedDistanceMiles,
                name: filterDisplayName,
              }
            )}
          </div>
        );
      } else {
        return (
          <div>
            {t("locationsNear", '{{count}} locations near "{{name}}"', {
              count: resultCount,
              name: filterDisplayName,
            })}
          </div>
        );
      }
    } else {
      return (
        <div>
          {t("locationWithCount", "{{count}} locations", {
            count: resultCount,
          })}
        </div>
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
}

const Map: React.FC<MapProps> = ({
  mapStyle,
  centerCoords,
  onDragHandler,
  scrollToResult,
  markerOptionsOverride,
}) => {
  const { t } = useTranslation();

  const documentIsUndefined = typeof document === "undefined";
  const iframe = documentIsUndefined
    ? undefined
    : (document.getElementById("preview-frame") as HTMLIFrameElement);

  const locatorMapDiv = documentIsUndefined
    ? null
    : ((iframe?.contentDocument || document)?.getElementById(
        "locatorMapDiv"
      ) as HTMLDivElement | null);
  const mapPadding = getMapboxMapPadding(locatorMapDiv);

  // During page generation we don't exist in a browser context
  //@ts-expect-error MapboxGL is not loaded in the iframe content window
  if (iframe?.contentDocument && !iframe.contentWindow?.mapboxgl) {
    // We are in an iframe, and mapboxgl is not loaded in yet
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <span className="text-gray-700 text-lg font-medium font-body-fontFamily">
            {t("loadingMap", "Loading Map...")}
          </span>
        </div>
      </div>
    );
  }

  const entityDocument: any = useDocument();
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
      mapboxOptions={{
        center: centerCoords,
        fitBoundsOptions: { padding: mapPadding },
        ...(mapStyle ? { style: mapStyle } : {}),
      }}
      onDrag={onDragHandler}
      PinComponent={LocatorMapPin}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={!!iframe?.contentDocument}
      onPinClick={scrollToResult}
      markerOptionsOverride={markerOptionsOverride}
    />
  );
};

const LocatorMapPin: PinComponent<Record<string, unknown>> = (props) => {
  const { result, selected } = props;

  const { width, height, color } = React.useMemo(() => {
    return selected
      ? {
          // zoomed in pin stylings
          height: "61.5px",
          width: "40.5px",
          color: "text-palette-secondary-dark",
        }
      : {
          // default pin stylings
          height: "41px",
          width: "27px",
          color: "text-palette-primary-dark",
        };
  }, [selected]);

  return (
    <MapPinIcon
      height={height}
      width={width}
      color={color}
      resultIndex={result.index}
    />
  );
};

interface FilterModalProps {
  showFilterModal: boolean;
  showOpenNowOption: boolean; // whether to show the Open Now filter option
  isOpenNowSelected: boolean; // whether the Open Now filter is currently selected by the user
  showDistanceOptions: boolean; // whether to show the Distance filter option
  selectedDistanceMiles: number | null;
  handleCloseModalClick: () => void;
  handleOpenNowClick: (selected: boolean) => void;
  handleDistanceClick: (distance: number) => void;
  handleClearFiltersClick: () => void;
}

const FilterModal = (props: FilterModalProps) => {
  const {
    showFilterModal,
    showOpenNowOption,
    isOpenNowSelected,
    showDistanceOptions,
    selectedDistanceMiles,
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
        <div className="font-bold">
          {t("refineYourSearch", "Refine Your Search")}
        </div>
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
              selectedDistanceMiles={selectedDistanceMiles}
            />
          )}
          <Facets
            customCssClasses={{
              divider: "bg-white",
              titleLabel: "font-bold text-md",
              optionInput: "h-4 w-4 accent-palette-primary-dark",
              optionLabel: "text-md",
              option: "space-x-4",
            }}
          />
        </div>
      </div>
      <div className="border-y border-gray-300 justify-center align-middle">
        <button
          className="w-full py-4 text-center font-bold text-palette-primary-dark"
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
        className="w-full flex justify-between items-center"
        {...getToggleProps()}
      >
        <div className="font-bold">{t("hours", "Hours")}</div>
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
          <label htmlFor={openNowCheckBoxId}>{t("openNow", "Open Now")}</label>
        </div>
      </div>
    </div>
  );
};

interface DistanceFilterProps {
  onChange: (distance: number) => void;
  selectedDistanceMiles: number | null;
}

const DistanceFilter = (props: DistanceFilterProps) => {
  const { selectedDistanceMiles, onChange } = props;
  const { t } = useTranslation();
  const { isExpanded, getToggleProps, getCollapseProps } = useCollapse({
    defaultExpanded: true,
  });
  const iconClassName = isExpanded
    ? "w-3 text-gray-400"
    : "w-3 text-gray-400 transform rotate-180";
  const distanceOptionsMiles = [5, 10, 25, 50];

  return (
    <div className="flex flex-col gap-4">
      <button
        className="w-full flex justify-between items-center"
        {...getToggleProps()}
      >
        <div className="font-bold">{t("distance", "Distance")}</div>
        <FaChevronUp className={iconClassName} />
      </button>
      <div {...getCollapseProps()}>
        {distanceOptionsMiles.map((distanceMiles) => (
          <div
            className="flex flex-row gap-4 items-center"
            id={`distanceOption-${distanceMiles}`}
            key={distanceMiles}
          >
            <button
              className="inline-flex bg-white"
              onClick={() => onChange(distanceMiles)}
              aria-label={`${t("selectDistanceLessThan", "Select distance less than")} ${distanceMiles} ${t("miles", "miles")}`}
            >
              <div className="text-palette-primary-dark">
                {selectedDistanceMiles === distanceMiles ? (
                  <FaDotCircle />
                ) : (
                  <FaRegCircle />
                )}
              </div>
            </button>
            <div className="inline-flex">
              {`< ${distanceMiles} ${t("miles", "miles")}`}
            </div>
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
  radius?: number,
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
        radius: radius ?? DEFAULT_RADIUS_MILES * MILES_TO_METERS,
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
