import { useTranslation } from "react-i18next";
import * as React from "react";
import { Coordinate } from "@yext/pages-components";
import {
  EntityField,
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { StreamDocument } from "../../utils/applyTheme";

type Size = { width: number; height: number };

export type MapboxStaticProps = {
  apiKey: string;
  coordinate: YextEntityField<Coordinate>;
  zoom?: number;
  mapStyle?: string;
};

const mapboxFields: Fields<MapboxStaticProps> = {
  apiKey: YextField("API Key", {
    type: "text",
  }),
  coordinate: YextField<any, Coordinate>("Coordinates", {
    type: "entityField",
    filter: { types: ["type.coordinate"] },
  }),
};

const DEFAULT_WIDTH = 1024;
const MIN_WIDTH = 100;
const MAX_WIDTH = 1280;
const HEIGHT = 300;

const getPrimaryColor = (streamDocument: StreamDocument) => {
  if (streamDocument?.__?.theme) {
    return (
      JSON.parse(streamDocument?.__?.theme)
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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [updateTrigger, setUpdateTrigger] = React.useState(0);
  const selfRef = React.useRef<T>(null);
  const [size, setSize] = React.useState<Size>({
    width: DEFAULT_WIDTH,
    height: HEIGHT,
  });

  React.useEffect(() => {
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
        MIN_WIDTH,
        Math.min(rect.width || node.clientWidth, MAX_WIDTH)
      ),
      height: HEIGHT,
    });
  }, [updateTrigger]);

  const updateEvents: string[] = [
    "resize",
    "load",
    "visibilitychange",
    "focus",
    "deviceorientation",
  ];

  const handleEvent = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setUpdateTrigger((prev) => prev + 1); // Trigger re-run
    }, 1000);
  }, [setUpdateTrigger]);

  // Listen for window resize
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    updateEvents.forEach((event: string) => {
      window.addEventListener(event, handleEvent, { signal });
    });
    return () => {
      controller.abort();
    };
  }, []);

  return [selfRef, size];
}

export const MapboxStaticMapComponent = ({
  apiKey,
  coordinate: coordinateField,
  zoom = 14,
  mapStyle = "light-v11",
}: MapboxStaticProps) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument<any>();

  const [imgRef, grandparentSize] = useGrandparentSize<HTMLImageElement>();

  const coordinate = resolveComponentData(
    coordinateField,
    i18n.language,
    streamDocument
  );

  if (!coordinate) {
    console.warn(`${coordinateField.field} is not present in the stream`);
    return <></>;
  } else if (!apiKey) {
    console.warn("API Key is required for MapboxStaticMap");
    return <></>;
  }

  const marker = `pin-l+${getPrimaryColor(streamDocument)}(${coordinate.longitude},${coordinate.latitude})`;

  return (
    <EntityField
      displayName={t("coordinate", "Coordinate")}
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
    >
      <img
        ref={imgRef}
        alt={t("map", "Map")}
        className="components w-full h-full object-cover"
        src={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${grandparentSize.width.toFixed(0)}x${grandparentSize.height.toFixed(0)}?access_token=${apiKey}`}
      />
    </EntityField>
  );
};

export const MapboxStaticMap: ComponentConfig<MapboxStaticProps> = {
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
  render: (props: MapboxStaticProps) => <MapboxStaticMapComponent {...props} />,
};
