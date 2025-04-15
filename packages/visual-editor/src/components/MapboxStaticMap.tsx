import * as React from "react";
import { Coordinate } from "@yext/pages-components";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";

type Size = { width: number; height: number };

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

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 300;
const MIN_HEIGHT = 300;
const MIN_WIDTH = 100;
const MAX_SIZE = 2048;

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

export function useGrandparentSize<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T>,
  Size,
] {
  const [apiCallCount, setApiCallCount] = React.useState(0);
  const [updateTrigger, setUpdateTrigger] = React.useState(0);
  const selfRef = React.useRef<T>(null);
  const [size, setSize] = React.useState<Size>({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  React.useEffect(() => {
    let timer: number = 0;
    if (apiCallCount < 3) {
      timer = window.setTimeout(() => {
        setApiCallCount((prev) => prev + 1);
      }, 1000);
    }

    let node: HTMLElement | null = selfRef.current;
    if (!node) return;

    // climb up 2 levels
    for (let i = 0; i < 2; i++) {
      node = node?.parentElement;
      if (!node) return;
    }

    // if it’s hidden, bail
    const style = window.getComputedStyle(node);
    if (style.display === "none") return;

    // measure
    const rect = node.getBoundingClientRect();
    setSize({
      width: Math.max(
        Math.min(rect.width || node.clientWidth, MAX_SIZE),
        MIN_WIDTH
      ),
      height: Math.max(
        Math.min(rect.height || node.clientHeight, MAX_SIZE),
        MIN_HEIGHT
      ),
    });

    return () => clearTimeout(timer); // Cleanup timeout on unmount or re-render
  }, [apiCallCount, updateTrigger]);

  const updateEvents: string[] = [
    "resize",
    "load",
    "visibilitychange",
    "scroll",
  ];
  // Listen for window resize
  React.useEffect(() => {
    const handleResize = () => {
      setUpdateTrigger((prev) => prev + 1); // Trigger re-run
    };

    updateEvents.forEach((event: string) => {
      window.addEventListener(event, handleResize);
    });
    return () => {
      updateEvents.forEach((event: string) => {
        window.removeEventListener(event, handleResize);
      });
    };
  }, []);

  return [selfRef, size];
}

const MapboxStaticMap = ({
  apiKey,
  coordinate: coordinateField,
  zoom = 14,
  mapStyle = "light-v11",
}: MapboxStaticProps) => {
  const document = useDocument<any>();

  const [imgRef, grandSize] = useGrandparentSize<HTMLImageElement>();

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
      ref={imgRef}
      className="components w-full h-full object-cover"
      src={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${grandSize.width.toFixed(0)}x${grandSize.height.toFixed(0)}?access_token=${apiKey}`}
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
