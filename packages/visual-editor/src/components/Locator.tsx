import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  CardComponent,
  CardProps,
  Coordinate,
  FilterSearch,
  getUserLocation,
  MapboxMap,
  OnDragHandler,
  OnSelectParams,
  VerticalResults,
  AnalyticsProvider,
  PinComponent,
} from "@yext/search-ui-react";
import {
  Matcher,
  provideHeadless,
  SearchHeadlessProvider,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
  Result,
} from "@yext/search-headless-react";
import * as React from "react";
import {
  Background,
  backgroundColors,
  BasicSelector,
  Button,
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
  CTA,
  Heading,
  normalizeSlug,
  PhoneAtom,
  useDocument,
} from "@yext/visual-editor";
import mapboxgl, { LngLat, LngLatBounds, MarkerOptions } from "mapbox-gl";
import {
  Address,
  AddressType,
  HoursStatus,
  HoursType,
} from "@yext/pages-components";
import { MapPinIcon } from "./MapPinIcon.js";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER: [number, number] = [-74.005371, 40.741611]; // New York City
const DEFAULT_RADIUS_METERS = 40233.6; // 25 miles
const TRANSLATIONS = {
  en: {
    searchThisArea: "Search This Area",
    useLocator: "Use our locator to find a location near you",
    noResults: "No results found for this area",
    viewMoreInformation: "View More Information",
    getDirections: "Get Directions",
    currentMapArea: "Current map area",
    currentLocation: "Current Location",
    searchHere: "Search here...",
    findALocation: "Find a Location",
    newYorkCity: "New York City, New York, United States",
  },
  fr: {
    searchThisArea: "Rechercher cette zone",
    useLocator:
      "Utilisez notre localisateur pour trouver un endroit près de chez vous",
    noResults: "Aucun résultat trouvé pour cette zone",
    viewMoreInformation: "Voir plus d'informations",
    getDirections: "Obtenir des directions",
    currentMapArea: "Zone de carte actuelle",
    currentLocation: "Emplacement actuel",
    searchHere: "Rechercher ici...",
    findALocation: "Trouver un emplacement",
    newYorkCity: "New York, État de New York, États-Unis",
  },
  es: {
    searchThisArea: "Buscar esta área",
    useLocator:
      "Utilice nuestro localizador para encontrar una ubicación cerca de usted",
    noResults: "No se encontraron resultados para esta área",
    viewMoreInformation: "Ver más información",
    getDirections: "Obtener direcciones",
    currentMapArea: "Área del mapa actual",
    currentLocation: "Ubicación actual",
    searchHere: "Buscar aquí...",
    findALocation: "Buscar una ubicación",
    newYorkCity: "Nueva York, Nueva York, Estados Unidos",
  },
  de: {
    searchThisArea: "Diese Fläche durchsuchen",
    useLocator:
      "Verwenden Sie unseren Locator, um einen Standort in Ihrer Nähe zu finden",
    noResults: "Keine Ergebnisse für dieses Gebiet gefunden",
    viewMoreInformation: "Mehr Informationen anzeigen",
    getDirections: "Routenplaner",
    currentMapArea: "Aktueller Kartenbereich",
    currentLocation: "Aktueller Standort",
    searchHere: "Hier suchen...",
    findALocation: "Standort finden",
    newYorkCity: "New York City, New York, Vereinigte Staaten",
  },
  it: {
    searchThisArea: "Cerca in quest'area",
    useLocator:
      "Usa il nostro localizzatore per trovare una posizione vicino a te",
    noResults: "Nessun risultato trovato per quest'area",
    viewMoreInformation: "Visualizza ulteriori informazioni",
    getDirections: "Ottieni indicazioni",
    currentMapArea: "Area della mappa corrente",
    currentLocation: "Posizione attuale",
    searchHere: "Cerca qui...",
    findALocation: "Trova una posizione",
    newYorkCity: "New York City, New York, Stati Uniti",
  },
  ja: {
    searchThisArea: "このエリアを検索",
    useLocator: "ロケーターを使用して近くの場所を見つける",
    noResults: "このエリアでは結果が見つかりませんでした",
    viewMoreInformation: "詳細情報を見る",
    getDirections: "道順を取得",
    currentMapArea: "現在の地図エリア",
    currentLocation: "現在地",
    searchHere: "ここを検索...",
    findALocation: "場所を探す",
    newYorkCity: "ニューヨーク市、ニューヨーク州、アメリカ合衆国",
  },
};

export type LocatorProps = {
  mapStyle?: string;
  entityTypeEnvVar?: string; // to be set via withPropOverrides
  experienceKeyEnvVar?: string; // to be set via withPropOverrides
};

const locatorFields: Fields<LocatorProps> = {
  mapStyle: BasicSelector("Map Style", [
    { label: "Default", value: "mapbox://styles/mapbox/streets-v12" },
    {
      label: "Satellite",
      value: "mapbox://styles/mapbox/satellite-streets-v12",
    },
    { label: "Light", value: "mapbox://styles/mapbox/light-v11" },
    { label: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
    {
      label: "Navigation (Day)",
      value: "mapbox://styles/mapbox/navigation-day-v1",
    },
    {
      label: "Navigation (Night)",
      value: "mapbox://styles/mapbox/navigation-night-v1",
    },
  ]),
};

export const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields: locatorFields,
  label: "Locator",
  render: (props) => <LocatorWrapper {...props} />,
};

const LocatorWrapper: React.FC<LocatorProps> = (props) => {
  const document: any = useDocument();
  const { searchAnalyticsConfig, searcher } = React.useMemo(() => {
    const searchHeadlessConfig = createSearchHeadlessConfig(
      document,
      props.experienceKeyEnvVar
    );
    if (searchHeadlessConfig === undefined) {
      return { searchAnalyticsConfig: undefined, searcher: undefined };
    }

    const searchAnalyticsConfig = createSearchAnalyticsConfig(document);
    return {
      searchAnalyticsConfig,
      searcher: provideHeadless(searchHeadlessConfig),
    };
  }, [document.id, document.locale]);

  if (searcher === undefined || searchAnalyticsConfig === undefined) {
    console.warn(
      "Could not create Locator component because Search Headless or Search Analytics config is undefined. Please check your environment variables."
    );
    return <></>;
  }
  return (
    <SearchHeadlessProvider searcher={searcher}>
      <AnalyticsProvider {...(searchAnalyticsConfig as any)}>
        <LocatorInternal {...props} />
      </AnalyticsProvider>
    </SearchHeadlessProvider>
  );
};

type SearchState = "not started" | "loading" | "complete";

const LocatorInternal: React.FC<LocatorProps> = (props) => {
  const { mapStyle, entityTypeEnvVar } = props;
  const entityType = getEntityType(entityTypeEnvVar);
  const locale = getDocumentLocale();
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

  const [userLocation, setUserLocation] =
    React.useState<[number, number]>(DEFAULT_MAP_CENTER);
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
            displayName: TRANSLATIONS[locale].newYorkCity,
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              value: {
                lat: DEFAULT_MAP_CENTER[1],
                lng: DEFAULT_MAP_CENTER[0],
                radius: DEFAULT_RADIUS_METERS,
                // TODO (kgerner): add name property once Search SDK updated
                // name: "New York City, New York, NY",
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

  return (
    <div className="components flex ve-h-screen ve-w-screen mx-auto">
      {/* Left Section: FilterSearch + Results. Full width for small screens */}
      <div className="w-full ve-h-screen md:w-2/5 lg:w-1/3 flex flex-col">
        <div className="px-8 py-6 gap-4 flex flex-col">
          <Heading level={3}>{TRANSLATIONS[locale].findALocation}</Heading>
          <FilterSearch
            searchFields={[
              { fieldApiName: DEFAULT_FIELD, entityType: entityType },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
            placeholder={TRANSLATIONS[locale].searchHere}
            ariaLabel={"Search Dropdown Input"}
            customCssClasses={{
              focusedOption: "bg-gray-200",
              inputElement: "rounded-md p-4",
            }}
          />
        </div>
        <div className="px-8 py-4 text-body-fontSize border-y border-gray-300">
          {resultCount === 0 &&
            searchState === "not started" &&
            TRANSLATIONS[locale].useLocator}
          {resultCount === 0 &&
            searchState === "complete" &&
            TRANSLATIONS[locale].noResults}
          {resultCount > 0 &&
            filterDisplayName &&
            getTranslatedResultCount(locale, resultCount, filterDisplayName)}
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
              {TRANSLATIONS[locale].searchThisArea}
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
  const locale = getDocumentLocale();
  const location = result.rawData;
  const distance = result.distance;

  // function that takes coordinates and returns a google maps link for directions
  const getGoogleMapsLink = (coordinate: Coordinate): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  };

  const distanceInMiles = distance
    ? (distance / 1609.344).toFixed(1)
    : undefined;

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
            {distanceInMiles && (
              <div className="font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize">
                {distanceInMiles + " mi"}
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
            <PhoneAtom
              phoneNumber={location.mainPhone}
              includeHyperlink={true}
              includeIcon={false}
              format={
                location.mainPhone.slice(0, 2) === "+1"
                  ? "domestic"
                  : "international"
              }
            />
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
              <CTA
                label={TRANSLATIONS[locale].getDirections}
                link={getGoogleMapsLink(
                  location.yextDisplayCoordinate || {
                    latitude: 0,
                    longitude: 0,
                  }
                )}
                linkType={"DRIVING_DIRECTIONS"}
                target={"_blank"}
                variant="link"
                className="font-bold text-palette-primary-dark"
              />
            )}
          </div>
        </div>
        <CTA
          label={TRANSLATIONS[locale].viewMoreInformation}
          link={getPath(location, locale)}
          linkType={"URL"}
          className="text-center basis-full py-3 break-words whitespace-normal"
          target={"_blank"}
          variant="primary"
        />
      </div>
    </Background>
  );
};

const getPath = (location: Location, locale: string) => {
  if (location.slug) {
    return location.slug;
  }

  const localePath = locale !== "en" ? `${locale}/` : "";
  const path = location.address
    ? `${localePath}${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${localePath}${location.id}`;

  return normalizeSlug(path);
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

const getDocumentLocale = () => {
  const entityDocument: any = useDocument();
  const fullLocale = entityDocument.meta?.locale || "en";
  let locale: keyof typeof TRANSLATIONS = fullLocale.split(/[_-]/)[0];
  if (!(locale in TRANSLATIONS)) {
    locale = "en";
  }
  return locale;
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

const getTranslatedResultCount = (
  locale: string,
  resultCount: number,
  filterDisplayName: string
) => {
  switch (locale) {
    case "en":
      return `${resultCount} locations near "${filterDisplayName}"`;
    case "fr":
      return `${resultCount} emplacements près de «${filterDisplayName}»`;
    case "es":
      return `${resultCount} ubicaciones cerca de "${filterDisplayName}"`;
    case "de":
      return `${resultCount} Standorte in der Nähe von "${filterDisplayName}"`;
    case "it":
      return `${resultCount} località vicino a "${filterDisplayName}"`;
    case "ja":
      return `「${filterDisplayName}」の近くの${resultCount}か所`;
  }
};
