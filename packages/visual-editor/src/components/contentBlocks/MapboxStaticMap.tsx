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
  themeManagerCn,
  Body,
} from "@yext/visual-editor";
import { ComponentConfig, Field, Fields } from "@measured/puck";
import { StreamDocument } from "../../utils/applyTheme";
import mapboxLogo from "../assets/mapbox-logo-black.svg";
import { Map } from "lucide-react";

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
  isEditing = false,
}: MapboxStaticProps & { isEditing?: boolean }) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument<any>();

  const coordinate = resolveComponentData(
    coordinateField,
    i18n.language,
    streamDocument
  );

  // Show empty state in editor mode when API key is missing
  if (!apiKey) {
    if (isEditing) {
      return (
        <div
          className={themeManagerCn(
            "relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5"
          )}
        >
          <Map className="w-12 h-12 text-gray-400" />
          <div className="flex flex-col items-center gap-0">
            <Body variant="base" className="text-gray-500 font-medium">
              {t(
                "staticMapEmptyStateSectionHidden",
                "Section hidden for all locations"
              )}
            </Body>
            <Body variant="base" className="text-gray-500 font-normal">
              {t(
                "staticMapEmptyStateAddApiKey",
                "Add an API key to preview your map"
              )}
            </Body>
          </div>
        </div>
      );
    }
    console.warn("API Key is required for MapboxStaticMap");
    return <></>;
  }

  if (!coordinate) {
    console.warn(`${coordinateField.field} is not present in the stream`);
    return <></>;
  }

  const marker = `pin-l+${getPrimaryColor(streamDocument)}(${coordinate.longitude},${coordinate.latitude})`;

  const staticImageSizes = {
    large: "1280x720",
    medium: "960x540",
    small: "412x412",
  } as const;

  type StaticImageSize = keyof typeof staticImageSizes;

  const getMapboxStaticImageUrl = (size: StaticImageSize) => {
    return `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${marker}/${coordinate.longitude},${coordinate.latitude},${zoom}/${staticImageSizes[size]}?access_token=${apiKey}&logo=false&attribution=false`;
  };

  return (
    <EntityField
      displayName={pt("coordinate", "Coordinate")}
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
      className="w-full"
    >
      <div className="relative h-[300px] w-full overflow-hidden">
        <picture>
          <source
            media="(max-width: 412px)"
            className="components h-full w-full object-cover"
            srcSet={getMapboxStaticImageUrl("small")}
          />
          <source
            media="(max-width: 960px)"
            className="components h-full w-full object-cover"
            srcSet={getMapboxStaticImageUrl("medium")}
          />
          <img
            src={getMapboxStaticImageUrl("large")}
            className="components h-full w-full object-cover"
            alt={t("map", "Map")}
          />
        </picture>
        {/* Mapbox requires attribution when using their static maps, https://docs.mapbox.com/help/dive-deeper/attribution/#static--print */}
        <span className="absolute bottom-0 right-0 bg-gray-400/50 text-[8px] text-black">
          © <a href="https://www.mapbox.com/about/maps">Mapbox</a>©{" "}
          <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
        </span>
        <span className="absolute bottom-0 left-0">
          <a href="https://www.mapbox.com/">
            <img src={mapboxLogo} alt="Mapbox" className="w-10" />
          </a>
        </span>
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
  render: (props: MapboxStaticProps & { puck?: { isEditing?: boolean } }) => {
    const isEditing = props.puck?.isEditing ?? false;
    return <MapboxStaticMapComponent {...props} isEditing={isEditing} />;
  },
};
