import { Result, useSearchState } from "@yext/search-headless-react";
import {
  DefaultRawDataType,
  MapboxMap,
  OnDragHandler,
  PinComponent,
  SectionProps,
} from "@yext/search-ui-react";
import { MapPinIcon } from "lucide-react";
import { MarkerOptions } from "mapbox-gl";
import React from "react";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { StreamDocument } from "../../../utils/index.ts";
import { VerticalLayout } from "./propsAndTypes.ts";

interface LayoutSectionProps extends SectionProps<DefaultRawDataType> {
  layoutType: VerticalLayout;
  resultsCount: number;
}

export const LayoutSection = ({
  layoutType,
  results,
  CardComponent,
  header,
  resultsCount = 4,
}: LayoutSectionProps) => {
  if (!CardComponent) return null;
  console.log(resultsCount);

  const layoutClasses =
    layoutType === "Grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col w-full";

  // const filteredResults = results.slice(0, resultsCount);

  return (
    <div className="flex flex-col mt-12">
      <div className="px-5 py-2.5 flex items-end border rounded-t-md">
        <h2 className="text-[22px]">{header?.props.label}</h2>
      </div>
      {layoutType === "Map" && results.length > 0 && (
        <div id="locatorMapDiv" className="w-full h-[300px] border-x border-t">
          <Map />
        </div>
      )}
      <div className={`${layoutClasses} w-full border rounded-b-md divide-y`}>
        {results.map((result, index) => (
          <CardComponent key={index} result={result} />
        ))}
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

const Map: React.FC<MapProps> = ({ mapStyle, centerCoords }) => {
  const entityDocument: StreamDocument = useDocument();

  // THIS is the real results source MapboxMap uses
  const results = useSearchState((s) => s.vertical.results) || [];

  const firstCoord: any =
    results?.[0]?.rawData?.yextDisplayCoordinate ??
    results?.[0]?.rawData?.coordinate;

  const center: [number, number] =
    centerCoords ??
    (firstCoord
      ? [firstCoord.longitude, firstCoord.latitude]
      : [-74.005371, 40.741611]);

  const mapboxOptions = {
    style: mapStyle || "mapbox://styles/mapbox/streets-v12",
    center,
    zoom: 10,
  };

  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement);

  const mapboxApiKey = entityDocument._env?.YEXT_MAPBOX_API_KEY;

  return (
    <MapboxMap
      key={results.length}
      mapboxAccessToken={mapboxApiKey}
      mapboxOptions={mapboxOptions}
      PinComponent={LocatorMapPin}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={false}
      getCoordinate={(result: any) => {
        const coord =
          result.rawData?.yextDisplayCoordinate ?? result.rawData?.coordinate;

        if (!coord) return undefined;

        return {
          latitude: coord.latitude,
          longitude: coord.longitude,
        };
      }}
    />
  );
};

const LocatorMapPin: PinComponent<DefaultRawDataType> = ({ selected }) => {
  const size = selected
    ? { height: 60, width: 40, color: "#0f766e" }
    : { height: 40, width: 26, color: "#134e4a" };

  return (
    <MapPinIcon
      height={size.height}
      width={size.width}
      color={size.color}
      fill={size.color}
    />
  );
};
