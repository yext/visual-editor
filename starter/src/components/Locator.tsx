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
} from "@yext/search-ui-react";
import {
  Matcher,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
} from "@yext/search-headless-react";
import * as React from "react";
import { BasicSelector, Body, Button, CTA, Heading } from "@yext/visual-editor";
import { LngLat, LngLatBounds } from "mapbox-gl";
import { normalizeSlug } from "@yext/visual-editor";
import { useEffect, useState } from "react";
import { HoursStatus } from "@yext/pages-components";
import { Address, Hours } from "../types/autogen.ts";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER = [-74.005371, 40.741611]; // New York City
const DEFAULT_RADIUS_METERS = 40233.6; // 25 miles

type LocatorProps = {
  mapStyle?: string;
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

const LocatorComponent: ComponentConfig<LocatorProps> = {
  fields: locatorFields,
  label: "Locator",
  render: (props) => <Locator {...props} />,
};

type SearchState = "not started" | "loading" | "complete";

const Locator: React.FC<LocatorProps> = (props) => {
  const { mapStyle } = props;
  const resultCount = useSearchState(
    (state) => state.vertical.resultsCount || 0,
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
        displayName: "Current map area",
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
    React.useState<number[]>(DEFAULT_MAP_CENTER);
  React.useEffect(() => {
    getUserLocation()
      .then((location) => {
        setUserLocation([location.coords.longitude, location.coords.latitude]);
        searchActions.setStaticFilters([
          {
            selected: true,
            displayName: "Current Location",
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
            displayName: "New York City, New York, NY",
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              value: {
                lat: DEFAULT_MAP_CENTER[1],
                lng: DEFAULT_MAP_CENTER[0],
                radius: DEFAULT_RADIUS_METERS,
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

  const [searchState, setSearchState] = useState<SearchState>("not started");

  useEffect(() => {
    if (!searchLoading && searchState === "loading") {
      setSearchState("complete");
    }
  }, [searchLoading]);

  const mapProps: MapProps = {
    ...(userLocation && { centerCoords: userLocation }),
    ...(mapStyle && { mapStyle }),
    onDragHandler: handleDrag,
  };

  return (
    <>
      <div className="flex w-full h-full aspect-[1/2] md:aspect-[3/2]">
        {/* Left Section: FilterSearch + Results. Full width for small screens */}
        <div className="w-full md:w-1/3 p-4 h-full flex flex-col">
          <FilterSearch
            searchFields={[
              { fieldApiName: DEFAULT_FIELD, entityType: DEFAULT_ENTITY_TYPE },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
          />
          <div id="innerDiv" className="flex-grow overflow-y-auto">
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
                Use our locator to find a location near you
              </Body>
            )}
            {resultCount === 0 && searchState === "complete" && (
              <Body className="py-2 border-y">
                No results found for this area
              </Body>
            )}
          </div>
        </div>

        {/* Right Section: Map. Hidden for small screens */}
        <div className="w-2/3 md:flex hidden">
          <div className="relative w-full h-full">
            <Map {...mapProps} />
            {showSearchAreaButton && (
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <Button
                  onClick={handleSearchAreaClick}
                  className="py-2 px-4 shadow-xl"
                >
                  <p>Search This Area</p>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface MapProps {
  mapStyle?: string;
  centerCoords?: number[];
  onDragHandler?: OnDragHandler;
}

const Map: React.FC<MapProps> = ({ mapStyle, centerCoords, onDragHandler }) => {
  const iframe = document.getElementById("preview-frame") as HTMLIFrameElement;
  const mapboxApiKey = "";
  if (iframe?.contentDocument && !iframe.contentWindow?.mapboxgl) {
    // We are in an iframe, and mapboxgl is not loaded in yet
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <span className="text-gray-700 text-lg font-medium">
            Loading Map...
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
      <div className="basis-3/4 pb-4">
        <Heading className="py-2 text-palette-primary-dark" level={1}>
          {location.name}
        </Heading>
        {location.hours && (
          <HoursStatus
            hours={location.hours}
            timezone={location.timezone}
            className="text-body-sm-fontSize"
          />
        )}
        {location.mainPhone && (
          <CTA
            label={formatPhoneNumber(location.mainPhone)}
            link={location.mainPhone}
            linkType={"PHONE"}
            className="py-3"
            variant="link"
          />
        )}
        <Body>{location.address.line1}</Body>
        <Body>{`${location.address.city}, ${location.address.region} ${location.address.postalCode}`}</Body>
        {location.yextDisplayCoordinate && (
          <CTA
            label={"Get Directions"}
            link={getGoogleMapsLink(
              location.yextDisplayCoordinate
                ? location.yextDisplayCoordinate
                : {
                    latitude: 0,
                    longitude: 0,
                  },
            )}
            linkType={"DRIVING_DIRECTIONS"}
            target={"_blank"}
            variant="link"
          />
        )}
      </div>
      {distanceInMiles && (
        <div className="basis-1/4 text-right py-2">
          {distanceInMiles + " mi"}
        </div>
      )}
      <CTA
        label={"View More Information"}
        link={getPath(location)}
        linkType={"URL"}
        className="text-center basis-full py-3"
        target={"_blank"}
        variant="primary"
      />
    </div>
  );
};

//reformats a phone number in the familiar (123)-456-7890 style
function formatPhoneNumber(phoneNumber: string) {
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = match[1] ? "+1 " : "";
    return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
  }
  return null;
}

const getPath = (location: Location) => {
  if (location.slug) {
    return location.slug;
  }

  // TODO: in the same way that locale is hardcoded to 'en' in dev.tsx we may need to eventually have the
  // right language populated here.
  const path = location.address
    ? `${location.address.region}/${location.address.city}/${location.address.line1}`
    : `${location.id}`;

  return normalizeSlug(path);
};

interface Location {
  address: Address;
  hours?: Hours;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
}

export { type LocatorProps, LocatorComponent as Locator };
