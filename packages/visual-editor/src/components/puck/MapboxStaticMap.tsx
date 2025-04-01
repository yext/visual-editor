import * as React from "react";
import { Coordinate } from "@yext/pages-components";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";
import { ComponentConfig, Fields } from "@measured/puck";

type MapboxStaticProps = {
  apiKey: string;
  coordinate: YextEntityField<Coordinate>;
  width?: number;
  height?: number;
  zoom?: number;
  mapStyle?: string;
};

const mapboxFields: Fields<MapboxStaticProps> = {
  apiKey: {
    label: "API Key",
    type: "text",
  },
  coordinate: YextEntityFieldSelector<any, Coordinate>({
    label: "Coordinates",
    filter: { types: ["type.coordinate"] },
  }),
};

const MapboxStaticMap = ({
  apiKey,
  coordinate: coordinateField,
  width = 1024,
  height = 300,
  zoom = 14,
  mapStyle = "light-v11",
}: MapboxStaticProps) => {
  const document = useDocument();
  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    coordinateField
  );

  if (!coordinate) {
    console.warn("yextDisplayCoordinate is not present in the stream");
    return <></>;
  } else if (!apiKey) {
    console.warn("API Key is required for MapboxStaticMap");
    return <></>;
  }

  const iframe = window.document.querySelector("iframe");
  const componentElement =
    iframe?.contentDocument?.querySelector(".components");
  const primaryColor = componentElement
    ? getComputedStyle(componentElement)
        .getPropertyValue("--colors-palette-primary")
        .trim()
        .replace("#", "")
    : "000000";

  const marker = `pin-l+${primaryColor}(${coordinate.longitude},${coordinate.latitude})`;

  return (
    <img
      className="components w-full"
      src={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${width}x${height}?access_token=${apiKey}`}
    />
  );
};

const MapboxStaticMapComponent: ComponentConfig<MapboxStaticProps> = {
  label: "Mapbox Static Map",
  fields: mapboxFields,
  defaultProps: {
    apiKey: "",
    coordinate: {
      field: "yextDisplayCoordinate",
      constantValue: {
        latitude: 0,
        longitude: 0,
      },
    },
  },
  render: (props: MapboxStaticProps) => <MapboxStaticMap {...props} />,
};

export { MapboxStaticMapComponent as MapboxStaticMap, type MapboxStaticProps };
