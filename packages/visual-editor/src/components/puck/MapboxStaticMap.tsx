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

const getPrimaryColor = (document: any) => {
  if (document?.__?.theme) {
    return (
      JSON.parse(document?.__?.theme)
        ?.["--colors-palette-primary"].trim()
        .replace("#", "") ?? "000000"
    );
  } else {
    const iframe = window.document.querySelector("iframe");
    const componentElement =
      iframe?.contentDocument?.querySelector(".components");
    return componentElement
      ? getComputedStyle(componentElement)
          .getPropertyValue("--colors-palette-primary")
          .trim()
          .replace("#", "")
      : "000000";
  }
};

const MapboxStaticMap = ({
  apiKey,
  coordinate: coordinateField,
  width = 1024,
  height = 300,
  zoom = 14,
  mapStyle = "light-v11",
}: MapboxStaticProps) => {
  const document = useDocument<any>();
  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    coordinateField
  );

  if (!coordinate) {
    console.warn(`${coordinateField} is not present in the stream`);
    return <></>;
  } else if (!apiKey) {
    console.warn("API Key is required for MapboxStaticMap");
    return <></>;
  }

  const marker = `pin-l+${getPrimaryColor(document)}(${coordinate.longitude},${coordinate.latitude})`;

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
