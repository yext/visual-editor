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

export type MapboxStaticProps = {
  apiKey: string;
  coordinate: YextEntityField<Coordinate>;
  mapStyle: string;
  zoom?: number;
};

export const mapStyleField: Field<string> = YextField(
  msg("fields.mapStyle", "Map Style"),
  {
    type: "select",
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

  // For use on Desktop (1280x720)
  const largeMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/1280x720?access_token=${apiKey}`;
  // For use on Desktop or Tablet (960x540)
  const mediumMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/960x540?access_token=${apiKey}`;
  // For use on Desktop, Tablet, or Mobile (412x412)
  const smallMapUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/412x412?access_token=${apiKey}`;

  return (
    <EntityField
      displayName={pt("coordinate", "Coordinate")}
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
      className="w-full"
    >
      <div className={`h-[300px] w-full overflow-hidden`}>
        <picture>
          <source
            media="(max-width: 412px)"
            className="components h-full w-full object-cover"
            srcSet={smallMapUrl}
          />
          <source
            media="(max-width: 960px)"
            className="components h-full w-full object-cover"
            srcSet={mediumMapUrl}
          />
          <img
            src={largeMapUrl}
            className="components h-full w-full object-cover"
            alt={t("map", "Map")}
          />
        </picture>
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
