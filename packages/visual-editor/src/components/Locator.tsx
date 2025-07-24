import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  AnalyticsProvider,
  CardComponent,
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
  Matcher,
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
  Heading,
  msg,
  useDocument,
  Toggle,
  YextField,
  getLocationPath,
  useTemplateProps,
} from "@yext/visual-editor";
import mapboxgl, { LngLat, LngLatBounds, MarkerOptions } from "mapbox-gl";
import {
  Address,
  AddressType,
  HoursStatus,
  HoursType,
} from "@yext/pages-components";
import { MapPinIcon } from "./MapPinIcon.js";
import { FaAngleRight } from "react-icons/fa";
import { formatPhoneNumber } from "./atoms/phone.js";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER: [number, number] = [-74.005371, 40.741611]; // New York City
const DEFAULT_RADIUS_METERS = 40233.6; // 25 miles
const HOURS_FIELD = "builtin.hours";

export interface LocatorProps {
  /**
   * The visual theme for the map tiles, chosen from a predefined list of Mapbox styles.
   * @defaultValue 'mapbox://styles/mapbox/streets-v12'
   */
  mapStyle?: string;

  /**
   * If 'true', displays a button to filter for locations that are currently open.
   * @defaultValue false
   */
  openNowButton?: boolean;

  /** @internal to be set via withPropOverrides */
  entityTypeEnvVar?: string;

  /** @internal to be set via withPropOverrides */
  experienceKeyEnvVar?: string;
}

const locatorFields: Fields<LocatorProps> = {
  mapStyle: BasicSelector({
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
};

/**
 * Avaliable on Locator templates.
 */
export const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields: locatorFields,
  label: msg("components.locator", "Locator"),
  render: (props) => <LocatorWrapper {...props} />,
};

const LocatorWrapper: React.FC<LocatorProps> = (props) => {
  const streamDocument = useDocument();
  const { searchAnalyticsConfig, searcher } = React.useMemo(() => {
    const searchHeadlessConfig = createSearchHeadlessConfig(
      streamDocument,
      props.experienceKeyEnvVar
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

const LocatorInternal: React.FC<LocatorProps> = (props) => {
  const { t } = useTranslation();
  const { mapStyle, openNowButton, entityTypeEnvVar } = props;
  const entityType = getEntityType(entityTypeEnvVar);
  const resultCount = useSearchState(
    (state) => state.vertical.resultsCount || 0
  );

  const [showSearchAreaButton, setShowSearchAreaButton] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState<LngLat | undefined>();
  const [mapBounds, setMapBounds] = React.useState<LngLatBounds | undefined>();

  const handleDrag: OnDragHandler = (center: LngLat, bounds: LngLatBounds) => {
    setMapCenter(center);
    setMapBounds(bounds);
    setShowSearchAreaButton(true);
  };

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
      searchActions.setStaticFilters([locationFilter]);
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
    const locationFilter: SelectableStaticFilter = {
      displayName: params.newDisplayName,
      selected: true,
      filter: {
        kind: "fieldValue",
        fieldId: params.newFilter.fieldId,
        value: params.newFilter.value,
        matcher: Matcher.Near,
      },
    };
    searchActions.setStaticFilters([locationFilter]);
    searchActions.executeVerticalQuery();
    setSearchState("loading");
  };

  const [userLocation, setUserLocation] = React.useState<
    [number, number] | undefined
  >(undefined);
  React.useEffect(() => {
    getUserLocation()
      .then((location) => {
        setUserLocation([location.coords.longitude, location.coords.latitude]);
        searchActions.setStaticFilters([
          {
            selected: true,
            displayName: "",
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              value: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                radius: DEFAULT_RADIUS_METERS,
                name: t("currentLocation", "Current Location"),
              },
              matcher: Matcher.Near,
            },
          },
        ]);
      })
      .catch(() => {
        searchActions.setStaticFilters([
          {
            selected: true,
            displayName: t(
              "newYorkCity",
              "New York City, New York, United States"
            ),
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              value: {
                lat: DEFAULT_MAP_CENTER[1],
                lng: DEFAULT_MAP_CENTER[0],
                radius: DEFAULT_RADIUS_METERS,
                name: t(
                  "newYorkCity",
                  "New York City, New York, United States"
                ),
              },
              matcher: Matcher.Near,
            },
          },
        ]);
      })
      .then(() => {
        searchActions.executeVerticalQuery();
        setSearchState("loading");
      });
  }, []);

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

  const mapProps: MapProps = {
    ...(userLocation && { centerCoords: userLocation }),
    ...(mapStyle && { mapStyle }),
    onDragHandler: handleDrag,
    scrollToResult: scrollToResult,
    markerOptionsOverride: markerOptionsOverride,
  };

  const [isSelected, setIsSelected] = React.useState(false);
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
    setIsSelected(isSelected);
    searchActions.setOffset(0);
    searchActions.resetFacets();
    executeSearch(searchActions);
  };

  const searchFilters = useSearchState((state) => state.filters);
  // If something else causes the filters to update, check if the hours filter is still present
  // - toggle off the Open Now toggle if not.
  React.useEffect(() => {
    setIsSelected(
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

  return (
    <div className="components flex ve-h-screen ve-w-screen mx-auto">
      {/* Left Section: FilterSearch + Results. Full width for small screens */}
      <div className="w-full ve-h-screen md:w-2/5 lg:w-1/3 flex flex-col">
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
            showCurrentLocationButton={!!userLocation}
            geolocationProps={{
              radius: 25,
            }}
          />
          {openNowButton && (
            <Toggle
              pressed={isSelected}
              onPressedChange={(pressed) => handleOpenNowClick(pressed)}
              className="py-2 px-2"
            >
              {t("openNow", "Open Now")}
            </Toggle>
          )}
        </div>
        <div className="px-8 py-4 text-body-fontSize border-y border-gray-300">
          {resultCount === 0 &&
            searchState === "not started" &&
            t(
              "useOurLocatorToFindALocationNearYou",
              "Use our locator to find a location near you"
            )}
          {resultCount === 0 &&
            searchState === "complete" &&
            t("noResultsFoundForThisArea", "No results found for this area")}
          {resultCount > 0 &&
            filterDisplayName &&
            t(
              "locationsNear",
              `${resultCount} locations near "${filterDisplayName}"`,
              {
                count: resultCount,
                filterDisplayName,
              }
            )}
        </div>
        <div id="innerDiv" className="overflow-y-auto" ref={resultsContainer}>
          {resultCount > 0 && (
            <VerticalResults
              CardComponent={LocationCard}
              setResultsRef={setResultsRef}
            />
          )}
        </div>
      </div>

      {/* Right Section: Map. Hidden for small screens */}
      <div className="md:w-3/5 lg:w-2/3 md:flex hidden relative">
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
  // During page generation we don't exist in a browser context
  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement);
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
        center: centerCoords ?? DEFAULT_MAP_CENTER,
        fitBoundsOptions: {
          padding: { top: 150, bottom: 150, left: 150, right: 150 },
        },
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

const LocationCard: CardComponent<Location> = ({
  result,
}: CardProps<Location>): React.JSX.Element => {
  const { t, i18n } = useTranslation();
  const { relativePrefixToRoot } = useTemplateProps();

  const location = result.rawData;
  const distance = result.distance;

  // function that takes coordinates and returns a google maps link for directions
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
  const handleVisitPageClick = useCardAnalyticsCallback(result, "VIEW_WEBSITE");
  const handlePhoneNumberClick = useCardAnalyticsCallback(
    result,
    "TAP_TO_CALL"
  );

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
            <Heading className="font-bold text-palette-primary-dark" level={4}>
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
              <HoursStatus
                hours={location.hours}
                timezone={location.timezone}
              />
            </div>
          )}
          {location.mainPhone && (
            <a
              href={location.mainPhone}
              onClick={handlePhoneNumberClick}
              className="components h-fit w-fit underline decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing text-palette-primary-dark"
            >
              {formatPhoneNumber(
                location.mainPhone,
                location.mainPhone.slice(0, 2) === "+1"
                  ? "domestic"
                  : "international"
              )}
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
            {location.yextDisplayCoordinate && (
              <a
                href={getGoogleMapsLink(
                  location.yextDisplayCoordinate || {
                    latitude: 0,
                    longitude: 0,
                  }
                )}
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
          <a
            href={getLocationPath(
              location,
              i18n.language,
              relativePrefixToRoot
            )}
            onClick={handleVisitPageClick}
          >
            {t("visitPage", "Visit Page")}
          </a>
        </Button>
      </div>
    </Background>
  );
};

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
