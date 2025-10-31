import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckContext,
  WithPuckProps,
} from "@measured/puck";
import {
  AnalyticsProvider,
  CardProps,
  Coordinate,
  executeSearch,
  FilterSearch,
  getUserLocation,
  MapboxMap,
  OnDragHandler,
  OnSelectParams,
  PinComponent,
  useCardAnalyticsCallback,
  VerticalResults,
  SearchI18nextProvider,
} from "@yext/search-ui-react";
import {
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
import * as React from "react";
import {
  Background,
  backgroundColors,
  BasicSelector,
  Button,
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
  DynamicOption,
  DynamicOptionsSelectorType,
  Heading,
  msg,
  useDocument,
  YextField,
  useTemplateProps,
  resolveUrlTemplate,
  mergeMeta,
  HoursStatusAtom,
} from "@yext/visual-editor";
import mapboxgl, { LngLat, LngLatBounds, MarkerOptions } from "mapbox-gl";
import { Address, AddressType, HoursType } from "@yext/pages-components";
import { MapPinIcon } from "./MapPinIcon.js";
import {
  FaAngleRight,
  FaCheckSquare,
  FaRegSquare,
  FaSlidersH,
  FaTimes,
} from "react-icons/fa";
import { formatPhoneNumber } from "./atoms/phone.js";
import { getValueFromQueryString } from "../utils/urlQueryString";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER: [number, number] = [-74.005371, 40.741611]; // New York City
const DEFAULT_RADIUS_METERS = 40233.6; // 25 miles
const HOURS_FIELD = "builtin.hours";
const INITIAL_LOCATION_KEY = "initialLocation";

// Keep only digits and at most one leading plus for tel: links.
// If the input already starts with "tel:", return it as-is.
function sanitizePhoneForTelHref(rawPhone?: string): string | undefined {
  if (!rawPhone) {
    return undefined;
  }
  if (rawPhone.startsWith("tel:")) {
    return rawPhone;
  }

  // Remove any '+' that is not the leading character and strip non-digits.
  const cleaned = rawPhone.replace(/(?!^\+)\+|[^\d+]/g, "");
  return `tel:${cleaned}`;
}

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
      facetFields: YextField(msg("fields.dynamicFilters", "Dynamic Filters"), {
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
      }),
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
};

/**
 * Available on Locator templates.
 */
export const LocatorComponent: ComponentConfig<{ props: LocatorProps }> = {
  fields: locatorFields,
  defaultProps: {
    filters: {
      openNowButton: false,
    },
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
  filters,
  mapStartingLocation,
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

  const filterDisplayName = useSearchState(
    (state) => state.filters.static?.[0]?.displayName
  );
  const handleFilterSelect = (params: OnSelectParams) => {
    const newDisplayName = params.newDisplayName;
    const locationFilter: SelectableStaticFilter = {
      displayName: newDisplayName,
      selected: true,
      filter: {
        kind: "fieldValue",
        fieldId: params.newFilter.fieldId,
        value: params.newFilter.value,
        matcher: Matcher.Near,
      },
    };
    searchActions.setStaticFilters([locationFilter, openNowFilter]);
    searchActions.executeVerticalQuery();
    setSearchState("loading");
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
    (result: CardProps<Location>) => <LocationCard {...result} puck={puck} />,
    [puck]
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
      let centerCoords = DEFAULT_MAP_CENTER;
      let displayName: string | undefined;
      const doSearch = () => {
        searchActions.setStaticFilters([
          {
            selected: true,
            displayName,
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              value: {
                lat: centerCoords[1],
                lng: centerCoords[0],
                radius: DEFAULT_RADIUS_METERS,
              },
              matcher: Matcher.Near,
            },
          },
        ]);
        searchActions.executeVerticalQuery();
        setSearchState("loading");
        setMapProps((prev) => ({ ...prev, centerCoords }));
      };

      const foundStartingLocationFromQueryParam = async (
        queryParam: string
      ): Promise<boolean> => {
        return searchActions
          .executeFilterSearch(queryParam, false, [
            {
              fieldApiName: DEFAULT_FIELD,
              entityType: entityType,
              fetchEntities: false,
            },
          ])
          .then((response: FilterSearchResponse | undefined) => {
            const firstResult = response?.sections[0]?.results[0];
            const filterFromResult = firstResult?.filter
              ?.value as NearFilterValue;

            if (
              firstResult &&
              firstResult.filter &&
              filterFromResult.lat &&
              filterFromResult.lng
            ) {
              displayName = firstResult.value;
              centerCoords = [filterFromResult.lng, filterFromResult.lat];
              return true;
            }
            return false;
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
        centerCoords = [location.coords.longitude, location.coords.latitude];
        setUserLocationRetrieved(true);

        // Try to reverse-geocode the coordinates to a human-readable place name using Mapbox
        if (mapboxApiKey) {
          const lang =
            (streamDocument.locale as string) ||
            (typeof navigator !== "undefined"
              ? navigator.language
              : undefined) ||
            "en";
          const lon = centerCoords[0];
          const lat = centerCoords[1];
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxApiKey}&types=place,region,country&limit=1&language=${encodeURIComponent(
            lang
          )}`;

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const feature = data.features && data.features[0];
            displayName = feature?.place_name || undefined;
          }
        }
      } catch {
        // 3. Fall back to mapStartingLocation prop
        try {
          if (mapStartingLocation?.latitude && mapStartingLocation.longitude) {
            centerCoords = parseMapStartingLocation(mapStartingLocation);
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
  }, [initialLocationParam]);

  const handleOpenNowClick = (selected: boolean) => {
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
    searchActions.resetFacets();
    executeSearch(searchActions);
  };

  const searchFilters = useSearchState((state) => state.filters);
  // If something else causes the filters to update, check if the hours filter is still present
  // - toggle off the Open Now toggle if not.
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

  const [showFilter, setShowFilter] = React.useState(false);

  return (
    <div className="components flex h-screen w-screen mx-auto">
      {/* Left Section: FilterSearch + Results. Full width for small screens */}
      <div className="h-screen w-full md:w-2/5 lg:w-1/3 flex flex-col">
        <div className="px-8 py-6 gap-4 flex flex-col">
          <Heading level={3}>{t("findALocation", "Find a Location")}</Heading>
          <FilterSearch
            searchFields={[
              { fieldApiName: DEFAULT_FIELD, entityType: entityType },
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
              radius: 25,
            }}
          />
        </div>
        <div className="px-8 py-4 text-body-fontSize border-y border-gray-300 relative inline-block">
          <div className="flex flex-row justify-between">
            <div>
              {resultCount === 0 &&
                searchState === "not started" &&
                t(
                  "useOurLocatorToFindALocationNearYou",
                  "Use our locator to find a location near you"
                )}
              {resultCount === 0 &&
                searchState === "complete" &&
                t(
                  "noResultsFoundForThisArea",
                  "No results found for this area"
                )}
              {resultCount > 0 &&
                (filterDisplayName
                  ? t(
                      "locationsNear",
                      `${resultCount} locations near "${filterDisplayName}"`,
                      {
                        count: resultCount,
                        filterDisplayName,
                      }
                    )
                  : t("locationWithCount", `${resultCount} locations`, {
                      count: resultCount,
                    }))}
            </div>
            {filters?.openNowButton && (
              <button
                className="inline-flex justify-between items-center gap-2 font-bold text-body-sm-fontSize bg-white text-palette-primary-dark"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                {t("filter", "Filter")}
                {<FaSlidersH />}
              </button>
            )}
          </div>
          {showFilter && (
            <div
              id="popup"
              className="absolute top-0 z-50 w-80 flex flex-col bg-white shadow-lg absolute left-full top-0 ml-2 rounded-md shadow-lg"
            >
              <div className="inline-flex justify-between items-center px-6 py-4 gap-4 border-b border-gray-300">
                <div className="font-bold">
                  {t("refineYourSearch", "Refine Your Search")}
                </div>
                <button
                  className="text-palette-primary-dark"
                  onClick={() => setShowFilter(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-6">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="font-bold">{t("hours", "Hours")}</div>
                    <div className="flex flex-row gap-1">
                      <button
                        className="inline-flex bg-white"
                        onClick={() => handleOpenNowClick(!isOpenNowSelected)}
                      >
                        <div className="inline-flex items-center gap-4">
                          {t("openNow", "Open Now")}
                          <div className="text-palette-primary-dark">
                            {isOpenNowSelected ? (
                              <FaCheckSquare />
                            ) : (
                              <FaRegSquare />
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="innerDiv" className="overflow-y-auto" ref={resultsContainer}>
          {resultCount > 0 && (
            <VerticalResults
              CardComponent={CardComponent}
              setResultsRef={setResultsRef}
            />
          )}
        </div>
      </div>

      {/* Right Section: Map. Hidden for small screens */}
      <div
        id="locatorMapDiv"
        className="md:w-3/5 lg:w-2/3 md:flex hidden relative"
      >
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

const LocationCard = React.memo(
  ({
    result,
    puck,
  }: {
    result: CardProps<Location>["result"];
    puck: PuckContext;
  }): React.JSX.Element => {
    const { document: streamDocument, relativePrefixToRoot } =
      useTemplateProps();
    const { t } = useTranslation();

    const location = result.rawData;
    const distance = result.distance;

    const getGoogleMapsLink = (coordinate: Coordinate): string => {
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
    };

    const distanceInMiles = distance
      ? (distance / 1609.344).toFixed(1)
      : undefined;
    const distanceInKilometers = distance
      ? (distance / 1000).toFixed(1)
      : undefined;

    const handleGetDirectionsClick = useCardAnalyticsCallback(
      result,
      "DRIVING_DIRECTIONS"
    );
    const handleVisitPageClick = useCardAnalyticsCallback(
      result,
      "VIEW_WEBSITE"
    );
    const handlePhoneNumberClick = useCardAnalyticsCallback(
      result,
      "TAP_TO_CALL"
    );

    const resolvedUrl = resolveUrlTemplate(
      mergeMeta(location, streamDocument),
      relativePrefixToRoot,
      puck.metadata?.resolveUrlTemplate
    );

    const formattedPhoneNumber = location.mainPhone
      ? formatPhoneNumber(
          location.mainPhone,
          location.mainPhone.slice(0, 2) === "+1" ? "domestic" : "international"
        )
      : null;

    const telHref = sanitizePhoneForTelHref(location.mainPhone);

    const googleMapsLink = (() => {
      if (!location.yextDisplayCoordinate) {
        return null;
      }
      return getGoogleMapsLink(location.yextDisplayCoordinate);
    })();

    return (
      <Background
        background={backgroundColors.background1.value}
        className="container flex flex-row border-b border-gray-300 p-8 gap-4"
      >
        <Background
          background={backgroundColors.background6.value}
          className="flex-shrink-0 w-6 h-6 rounded-full font-bold flex items-center justify-center text-body-sm-fontSize"
        >
          {result.index}
        </Background>
        <div className="flex flex-wrap gap-6 w-full">
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <Heading
                className="font-bold text-palette-primary-dark"
                level={4}
              >
                {location.name}
              </Heading>
              {distance && (
                <div className="font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize">
                  {t("distanceInUnit", `${distanceInMiles} mi`, {
                    distanceInMiles,
                    distanceInKilometers,
                  })}
                </div>
              )}
            </div>
            {location.hours && (
              <div className="font-body-fontFamily text-body-fontSize gap-8">
                <HoursStatusAtom
                  hours={location.hours}
                  timezone={location.timezone}
                  className="text-body-fontSize"
                  boldCurrentStatus={false}
                />
              </div>
            )}
            {location.mainPhone && (
              <a
                href={telHref}
                onClick={handlePhoneNumberClick}
                className="components h-fit w-fit underline decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing text-palette-primary-dark"
              >
                {formattedPhoneNumber}
              </a>
            )}
            <div className="flex flex-col gap-1 w-full">
              {location.address && (
                <div className="font-body-fontFamily font-body-fontWeight text-body-md-fontSize gap-4">
                  <Address
                    address={location.address}
                    lines={[
                      ["line1"],
                      ["line2"],
                      ["city", "region", "postalCode"],
                    ]}
                  />
                </div>
              )}
              {googleMapsLink && (
                <a
                  href={googleMapsLink}
                  onClick={handleGetDirectionsClick}
                  className="components h-fit items-center w-fit underline gap-2 decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing flex font-bold text-palette-primary-dark"
                >
                  {t("getDirections", "Get Directions")}
                  <FaAngleRight size={"12px"} />
                </a>
              )}
            </div>
          </div>
          <Button asChild className="basis-full" variant="primary">
            <a href={resolvedUrl} onClick={handleVisitPageClick}>
              {t("visitPage", "Visit Page")}
            </a>
          </Button>
        </div>
      </Background>
    );
  }
);

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

interface Location {
  address: AddressType;
  hours?: HoursType;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
}
