import { ComponentConfig, Fields } from "@measured/puck";
import {
  FilterSearch,
  getUserLocation,
  MapboxMap,
  OnDragHandler,
  OnSelectParams,
  StandardCard,
  VerticalResults,
} from "@yext/search-ui-react";
import {
  Matcher,
  SelectableStaticFilter,
  useSearchActions,
  useSearchState,
} from "@yext/search-headless-react";
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { BasicSelector, themeManagerCn } from "@yext/visual-editor";
// import { MapboxMap } from "./MapboxMap2";
import { LngLat, LngLatBounds } from "mapbox-gl";

const DEFAULT_FIELD = "builtin.location";
const DEFAULT_ENTITY_TYPE = "location";
const DEFAULT_MAP_CENTER = [-74.005371, 40.741611]; // New York City
const DEFAULT_RADIUS_METERS = 40233.6; // 25 miles

const locatorVariants = cva("", {
  variants: {
    backgroundColor: {
      default: "bg-locator-backgroundColor",
      primary: "bg-palette-primary",
      secondary: "bg-palette-secondary",
      accent: "bg-palette-accent",
      text: "bg-palette-text",
      background: "bg-palette-background",
    },
  },
  defaultVariants: {
    backgroundColor: "default",
  },
});

interface LocatorProps extends VariantProps<typeof locatorVariants> {
  mapStyle?: string;
}

const locatorFields: Fields<LocatorProps> = {
  backgroundColor: BasicSelector("Background Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
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

const Locator: React.FC<LocatorProps> = (props) => {
  const { backgroundColor, mapStyle } = props;
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
      });
  }, []);

  const searchLoading = useSearchState((state) => state.searchStatus.isLoading);
  const mapProps: MapProps = {
    ...(userLocation && { centerCoords: userLocation }),
    ...(mapStyle && { mapStyle }),
    onDragHandler: handleDrag,
  };

  return (
    <>
      <div className="flex w-full h-full aspect-[3/2]">
        {/* Left Section: FilterSearch + Results. Full width for small screens */}
        <div className="w-full md:w-1/3 p-4">
          <FilterSearch
            searchFields={[
              { fieldApiName: DEFAULT_FIELD, entityType: DEFAULT_ENTITY_TYPE },
            ]}
            onSelect={(params) => handleFilterSelect(params)}
          />
          <div>
            {resultCount > 0 && (
              <VerticalResults CardComponent={StandardCard} />
            )}
            {resultCount === 0 && !searchLoading && (
              <div
                className={themeManagerCn(
                  "flex items-center justify-center",
                  locatorVariants({ backgroundColor }),
                )}
              >
                <p className="pt-4 text-2xl">No results found for this area</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Map. Hidden for small screens */}
        <div className="w-2/3 md:flex hidden">
          <div className="relative w-full h-full">
            <Map {...mapProps} />
            {showSearchAreaButton && (
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <button
                  onClick={handleSearchAreaClick}
                  className="rounded-2xl border bg-white py-2 px-4 shadow-xl"
                >
                  <p>Search This Area</p>
                </button>
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

export { type LocatorProps, LocatorComponent as Locator };
