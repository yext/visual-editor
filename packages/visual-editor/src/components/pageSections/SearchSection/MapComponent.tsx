import { useSearchState } from "@yext/search-headless-react";
import {
  PinComponent,
  DefaultRawDataType,
  MapboxMap,
} from "@yext/search-ui-react";
import { MapPin } from "lucide-react";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { StreamDocument } from "../../../utils/index.ts";

const LocatorPin: PinComponent<DefaultRawDataType> = ({ selected }) => {
  const size = selected ? 40 : 28;
  const color = selected ? "#0f766e" : "#134e4a";

  return <MapPin width={size} height={size} fill={color} color={color} />;
};

export const MapComponent = () => {
  const results = useSearchState((s) => s.vertical.results);
  const entityDocument: StreamDocument = useDocument();

  const iframe =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("preview-frame") as HTMLIFrameElement | null);

  if (!results || results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading map...
      </div>
    );
  }
  const mapboxApiKey = entityDocument._env?.YEXT_MAPBOX_API_KEY;

  const first: any =
    results[0].rawData?.yextDisplayCoordinate ?? results[0].rawData?.coordinate;

  if (!first) return null;

  return (
    <MapboxMap
      key={results.length}
      mapboxAccessToken={mapboxApiKey}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={true}
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
