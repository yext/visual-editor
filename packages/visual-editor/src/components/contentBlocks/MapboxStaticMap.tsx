import { useTranslation } from "react-i18next";
import { Coordinate } from "@yext/pages-components";
import {
  EntityField,
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextField,
  msg,
  pt,
} from "@yext/visual-editor";
import { ComponentConfig, Field, Fields } from "@measured/puck";
import { StreamDocument } from "../../utils/applyTheme";

const SIZE = 512;

export type MapboxStaticProps = {
  apiKey: string;
  coordinate: YextEntityField<Coordinate>;
  mapStyle: string;
  zoom?: number;
  aspectRatio?: string;
};

export const mapStyleField: Field<string> = YextField(
  msg("fields.mapStyle", "Map Style"),
  {
    type: "radio",
    options: [
      { value: "streets-v12", label: msg("fields.options.default", "Default") },
      {
        value: "satellite-streets-v12",
        label: msg("fields.options.satellite", "Satellite"),
      },
      { value: "light-v11", label: msg("fields.options.light", "Light") },
      { value: "dark-v11", label: msg("fields.options.dark", "Dark") },
      {
        value: "navigation-day-v1",
        label: msg("fields.options.navigationDay", "Navigation (Day)"),
      },
      {
        value: "navigation-night-v1",
        label: msg("fields.options.navigationNight", "Navigation (Night)"),
      },
    ],
  }
);

const mapboxFields: Fields<MapboxStaticProps> = {
  apiKey: YextField(msg("fields.apiKey", "API Key"), {
    type: "text",
  }),
  coordinate: YextField<any, Coordinate>(
    msg("fields.coordinates", "Coordinates"),
    {
      type: "entityField",
      filter: { types: ["type.coordinate"] },
    }
  ),
  mapStyle: mapStyleField,
};

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

export const MapboxStaticMapComponent = ({
  apiKey,
  coordinate: coordinateField,
  zoom = 14,
  mapStyle = "light-v11",
  aspectRatio = "aspect-square",
}: MapboxStaticProps) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument<any>();

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

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${SIZE * 2}x${SIZE}?access_token=${apiKey}`;

  return (
    <EntityField
      displayName={pt("coordinate", "Coordinate")}
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
    >
      <div className={`h-full overflow-hidden ${aspectRatio}`}>
        <img
          alt={t("map", "Map")}
          className="components h-full object-cover"
          src={mapUrl}
        />
      </div>
    </EntityField>
  );
};

export const MapboxStaticMap: ComponentConfig<{ props: MapboxStaticProps }> = {
  label: msg("components.mapboxStaticMap", "Mapbox Static Map"),
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
    mapStyle: "streets-v12",
  },
  render: (props: MapboxStaticProps) => <MapboxStaticMapComponent {...props} />,
};
