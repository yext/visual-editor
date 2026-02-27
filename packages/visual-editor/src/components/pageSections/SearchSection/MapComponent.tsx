import { Coordinate, Map, MapboxMaps, Marker } from "@yext/pages-components";
import { useSearchState } from "@yext/search-headless-react";
import {
  DefaultRawDataType,
  MapboxMap,
  PinComponent,
} from "@yext/search-ui-react";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { StreamDocument } from "../../../utils/index.ts";
import { Body } from "../../atoms/body.tsx";
import { useTranslation } from "react-i18next";

interface MapComponentProps {
  isUniversal?: boolean;
  results?: any[];
}

const LocatorPin: PinComponent<DefaultRawDataType> = ({ selected }) => {
  const size = selected ? 42 : 30;
  const color = selected ? "#0f766e" : "#134e4a";
  return <MapPin width={size} height={size} fill={color} color={color} />;
};

export const MapComponent = ({
  isUniversal = false,
  results = [],
}: MapComponentProps) => {
  const verticalResults = useSearchState((s) => s.vertical.results) ?? [];

  const mapResults = isUniversal ? results : verticalResults;
  const { t } = useTranslation();
  const entityDocument: StreamDocument = useDocument();
  const mapboxApiKey =
    entityDocument._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;

  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement | null);

  if (!mapResults || mapResults.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        {t("loadingMap", "Loading Map...")}
      </div>
    );
  }

  if (!mapboxApiKey) {
    return (
      <div className="h-[300px] flex items-center justify-center border text-gray-500">
        <Body variant="base" className="text-gray-500 font-normal">
          {t(
            "staticMapEmptyStateAddApiKey",
            "Add an API key to preview your map"
          )}
        </Body>
      </div>
    );
  }

  const first =
    mapResults[0].rawData?.yextDisplayCoordinate ??
    mapResults[0].rawData?.coordinate;

  if (!first) return null;

  if (isUniversal) {
    const coordinates: Coordinate[] = mapResults
      .map((r) => r.rawData?.yextDisplayCoordinate)
      .filter((coord): coord is Coordinate => Boolean(coord));

    return (
      <Map
        apiKey={mapboxApiKey}
        controls={false}
        provider={MapboxMaps}
        bounds={coordinates}
        iframeId="preview-frame"
        providerOptions={{
          center: [first.longitude, first.latitude],
          zoom: 10,
          style: "mapbox://styles/mapbox/streets-v12",
        }}
        className="w-full h-full"
      >
        {mapResults.map((result, index) => {
          const coord =
            result.rawData?.yextDisplayCoordinate ?? result.rawData?.coordinate;

          if (!coord) return null;

          return (
            <Marker key={result.id ?? index} coordinate={coord} id={index + ""}>
              <MapPin width={40} height={40} fill="#0f766e" color="#0f766e" />
            </Marker>
          );
        })}
      </Map>
    );
  }

  return (
    <MapboxMap
      key={mapResults.length}
      mapboxAccessToken={mapboxApiKey}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates
      mapboxOptions={{
        center: [first.longitude, first.latitude],
        zoom: 10,
        style: "mapbox://styles/mapbox/streets-v12",
      }}
      PinComponent={LocatorPin}
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
