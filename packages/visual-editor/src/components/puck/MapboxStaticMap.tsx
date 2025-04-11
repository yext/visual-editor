import * as React from "react";
import { Coordinate } from "@yext/pages-components";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";
import { ComponentConfig, Fields } from "@measured/puck";

const WIDTH_MIN = 300;
const WIDTH_MAX = 2048;
const HEIGHT_MIN = 300;
const HEIGHT_MAX = 2048;

type MapboxStaticProps = {
  apiKey: string;
  coordinate: YextEntityField<Coordinate>;
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
        ?.["--colors-palette-primary"]?.trim()
        ?.replace("#", "") ?? "000000"
    );
  } else {
    const iframe = window.document?.querySelector("iframe");
    const componentElement =
      iframe?.contentDocument?.querySelector(".components");
    return componentElement
      ? getComputedStyle(componentElement)
          ?.getPropertyValue("--colors-palette-primary")
          ?.trim()
          ?.replace("#", "")
      : "000000";
  }
};

const MapboxStaticMap = ({
  apiKey,
  coordinate: coordinateField,
  zoom = 14,
  mapStyle = "light-v11",
}: MapboxStaticProps) => {
  const document = useDocument<any>();

  const ref = React.useRef<HTMLImageElement | null>(null);
  const [size, setSize] = React.useState({ width: 1024, height: 300 });

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (ref.current?.parentElement) {
      observer.observe(ref.current?.parentElement);
    }

    return () => observer.disconnect();
  }, []);

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

  const heightClamped = Math.min(Math.max(size.height, HEIGHT_MIN), HEIGHT_MAX);
  const widthClamped = Math.min(Math.max(size.width, WIDTH_MIN), WIDTH_MAX);

  return (
    <img
      ref={ref}
      className="components w-full"
      src={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${widthClamped}x${heightClamped}?access_token=${apiKey}`}
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
