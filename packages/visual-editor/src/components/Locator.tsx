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
  ResultsCount,
  VerticalResults,
  AnalyticsProvider,
} from "@yext/search-ui-react";
import {
  Matcher,
  provideHeadless,
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
  Body,
  Button,
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
  CTA,
  Heading,
  normalizeSlug,
  PhoneAtom,
  useDocument,
  i18n,
} from "@yext/visual-editor";
import { LngLat, LngLatBounds } from "mapbox-gl";
import {
  Address,
  AddressType,
  HoursStatus,
  HoursType,
} from "@yext/pages-components";

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
  },
};

export type LocatorProps = {
  mapStyle?: string;
};

const locatorFields: Fields<LocatorProps> = {
  mapStyle: BasicSelector("Map Style", [
    { label: i18n("Default"), value: "mapbox://styles/mapbox/streets-v12" },
    {
      label: i18n("Satellite"),
      value: "mapbox://styles/mapbox/satellite-streets-v12",
    },
    { label: i18n("Light"), value: "mapbox://styles/mapbox/light-v11" },
    { label: i18n("Dark"), value: "mapbox://styles/mapbox/dark-v11" },
    {
      label: i18n("Navigation (Day)"),
      value: "mapbox://styles/mapbox/navigation-day-v1",
    },
    {
      label: i18n("Navigation (Night)"),
      value: "mapbox://styles/mapbox/navigation-night-v1",
    },
  ]),
};

export const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields: locatorFields,
  label: i18n("Locator"),
  render: (props) => <LocatorWrapper {...props} />,
};

const LocatorWrapper: React.FC<LocatorProps> = (props) => {
  const document: any = useDocument();
  const { searchAnalyticsConfig, searcher } = React.useMemo(() => {
    const searchHeadlessConfig = createSearchHeadlessConfig(document);
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
  const entityType = getEntityType();
  const locale = getDocumentLocale();
  const { mapStyle } = props;
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
            displayName: "New York City, New York, United States",
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

  const mapProps: MapProps = {
    ...(userLocation && { centerCoords: userLocation }),
    ...(mapStyle && { mapStyle }),
    onDragHandler: handleDrag,
  };

  return (
    <>
      <div className="components flex ve-h-screen ve-w-screen">
        {/* Left Section: FilterSearch + Results. Full width for small screens */}
        <div className="w-full h-full md:w-2/5 lg:w-1/3 p-4 flex flex-col">
          <FilterSearch
            searchFields={[
              { fieldApiName: DEFAULT_FIELD, entityType: entityType },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
            placeholder={TRANSLATIONS[locale].searchHere}
            ariaLabel={"Search Dropdown Input"}
            customCssClasses={{
              focusedOption: "bg-gray-200",
              inputElement: "rounded-md h-9 p-2",
            }}
          />
          <div id="innerDiv" className="overflow-y-auto">
            {resultCount > 0 && (
              <div>
                <ResultsCount
                  customCssClasses={{ resultsCountContainer: "py-1 text-lg" }}
                />
                <VerticalResults CardComponent={LocationCard} />
              </div>
            )}
            {resultCount === 0 && searchState === "not started" && (
              <Body className="py-2 border-y">
                {TRANSLATIONS[locale].useLocator}
              </Body>
            )}
            {resultCount === 0 && searchState === "complete" && (
              <Body className="py-2 border-y">
                {TRANSLATIONS[locale].noResults}
              </Body>
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
    </>
  );
};

interface MapProps {
  mapStyle?: string;
  centerCoords?: [number, number];
  onDragHandler?: OnDragHandler;
}

const Map: React.FC<MapProps> = ({ mapStyle, centerCoords, onDragHandler }) => {
  // During page generation we don't exist in a browser context
  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement);
  const entityDocument: any = useDocument();
  const mapboxApiKey = entityDocument._env?.YEXT_MAPBOX_API_KEY;
  //@ts-expect-error MapboxGL is not loaded in the iframe content window
  if (iframe?.contentDocument && !iframe.contentWindow?.mapboxgl) {
    // We are in an iframe, and mapboxgl is not loaded in yet
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <span className="text-gray-700 text-lg font-medium font-body-fontFamily">
            {i18n("Loading Map...")}
          </span>
        </div>
      </div>
    );
  }
  return (
    <MapboxMap
      mapboxAccessToken={mapboxApiKey || ""}
      mapboxOptions={{
        center: centerCoords ?? DEFAULT_MAP_CENTER,
        ...(mapStyle ? { style: mapStyle } : {}),
      }}
      onDrag={onDragHandler}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={!!iframe?.contentDocument}
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
    <div className="flex flex-wrap border-y px-4 py-4">
      <Background
        background={backgroundColors.background1.value}
        className="container"
      >
        <div className="basis-3/4 pb-4">
          <Heading className="py-2" level={3}>
            {location.name}
          </Heading>
          {location.hours && (
            <div className="font-body-fontFamily text-body-sm-fontSize">
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
          {location.address && (
            <div className="font-body-fontFamily font-body-fontWeight text-body-sm-fontSize">
              <Address
                address={location.address}
                lines={[["line1"], ["line2"], ["city", "region", "postalCode"]]}
              />
            </div>
          )}
          {location.yextDisplayCoordinate && (
            <CTA
              label={TRANSLATIONS[locale].getDirections}
              link={getGoogleMapsLink(
                location.yextDisplayCoordinate
                  ? location.yextDisplayCoordinate
                  : {
                      latitude: 0,
                      longitude: 0,
                    }
              )}
              linkType={"DRIVING_DIRECTIONS"}
              target={"_blank"}
              variant="link"
            />
          )}
          {distanceInMiles && (
            <div className="basis-1/4 py-2 font-body-fontFamily font-body-fontWeight text-body-fontSize">
              {distanceInMiles + " mi"}
            </div>
          )}
        </div>
      </Background>
      <CTA
        label={TRANSLATIONS[locale].viewMoreInformation}
        link={getPath(location, locale)}
        linkType={"URL"}
        className="text-center basis-full py-3 break-words whitespace-normal"
        target={"_blank"}
        variant="primary"
      />
    </div>
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

const getEntityType = () => {
  const entityDocument: any = useDocument();
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
