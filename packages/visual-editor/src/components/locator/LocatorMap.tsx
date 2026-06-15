import {
  Coordinate,
  MapboxMap,
  MapMarkerOptions,
  OnDragHandler,
  PinComponentProps,
} from "@yext/search-ui-react";
import { Result } from "@yext/search-headless-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDocument } from "../../hooks/useDocument.tsx";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { Body } from "../atoms/body.tsx";
import { MapPinIcon } from "../MapPinIcon.tsx";
import { isVisualEditorTestEnv } from "../testing/utils.ts";
import { Location } from "./LocatorResultCard.tsx";
import {
  DEFAULT_PIN_ICON_WIDTH,
  getMapboxMapPadding,
  LocationStyleConfig,
} from "./locatorUtils.ts";

export const LoadingMapPlaceholder = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
        <Body className="text-gray-700" variant="lg">
          {t("loadingMap", "Loading Map...")}
        </Body>
      </div>
    </div>
  );
};

const LocatorTestMap = () => {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #dcfce7 0%, #dbeafe 55%, #fde68a 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundPosition: "0 0, 0 0",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
};

interface MapProps {
  mapStyle?: string;
  centerCoords?: Coordinate;
  onDragHandler?: OnDragHandler;
  scrollToResult?: (result: Result<Location> | undefined) => void;
  markerOptionsOverride?: (selected: boolean) => MapMarkerOptions;
  locationStyleConfig?: LocationStyleConfig;
}

export const LocatorMap: React.FC<MapProps> = ({
  mapStyle,
  centerCoords,
  onDragHandler,
  scrollToResult,
  markerOptionsOverride,
  locationStyleConfig,
}) => {
  const entityDocument: StreamDocument = useDocument();

  const documentIsUndefined = typeof document === "undefined";
  const iframe = documentIsUndefined
    ? undefined
    : (document.getElementById("preview-frame") as HTMLIFrameElement);

  const locatorMapDiv = documentIsUndefined
    ? null
    : ((iframe?.contentDocument || document)?.getElementById(
        "locatorMapDiv"
      ) as HTMLDivElement | null);

  const mapPadding = React.useMemo(
    () => getMapboxMapPadding(locatorMapDiv),
    [locatorMapDiv]
  );
  const mapboxOptions = React.useMemo(
    () => ({
      center: centerCoords,
      fitBoundsOptions: { padding: mapPadding },
      ...(mapStyle ? { style: mapStyle } : {}),
    }),
    [centerCoords, mapPadding, mapStyle]
  );
  const PinComponent = React.useMemo(
    () =>
      function PinComponent<T>(pinProps: PinComponentProps<T>) {
        return (
          <LocatorMapPin
            {...pinProps}
            locationStyleConfig={locationStyleConfig}
          />
        );
      },
    [locationStyleConfig]
  );

  if (isVisualEditorTestEnv()) {
    return <LocatorTestMap />;
  }

  // During page generation we don't exist in a browser context
  //@ts-expect-error MapboxGL is not loaded in iframe content window
  if (iframe?.contentDocument && !iframe.contentWindow?.mapboxgl) {
    // We are in an iframe, and mapboxgl is not loaded in yet
    return <LoadingMapPlaceholder />;
  }

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
      mapboxOptions={mapboxOptions}
      onDrag={onDragHandler}
      PinComponent={PinComponent}
      iframeWindow={iframe?.contentWindow ?? undefined}
      allowUpdates={!!iframe?.contentDocument}
      onPinClick={scrollToResult}
      markerOptionsOverride={markerOptionsOverride}
    />
  );
};

type LocatorMapPinProps<T> = PinComponentProps<T> & {
  locationStyleConfig?: LocationStyleConfig;
};

const LocatorMapPin = <T,>({
  result,
  selected,
  locationStyleConfig,
}: LocatorMapPinProps<T>) => {
  const entityType = result.entityType;
  const entityLocationStyle = entityType
    ? locationStyleConfig?.[entityType]
    : undefined;

  return (
    <MapPinIcon
      color={entityLocationStyle?.color}
      resultIndex={result.index}
      icon={entityLocationStyle?.customImage?.url ?? entityLocationStyle?.icon}
      iconWidth={
        entityLocationStyle?.customImage?.width ?? DEFAULT_PIN_ICON_WIDTH
      }
      disableContrastIcon={!!entityLocationStyle?.customImage}
      aspectRatio={entityLocationStyle?.customImage?.aspectRatio}
      selected={selected}
    />
  );
};
