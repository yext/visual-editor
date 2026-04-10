import { useTranslation } from "react-i18next";
import { Coordinate } from "@yext/pages-components";
import { EntityField } from "../../editor/EntityField.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { Body } from "../atoms/body.tsx";
import {
  ComponentConfig,
  Field,
  Fields,
  PuckComponent,
} from "@puckeditor/core";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import mapboxLogo from "../assets/mapbox-logo-black.svg";
import { Map } from "lucide-react";
import { getThemeValue } from "../../utils/getThemeValue.ts";

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
  return (
    getThemeValue("--colors-palette-primary", streamDocument)
      ?.replace("#", "")
      ?.trim() ?? "000000"
  );
};

const isVisualEditorTestEnv = () =>
  (typeof __VISUAL_EDITOR_TEST__ !== "undefined" &&
    __VISUAL_EDITOR_TEST__ === true) ||
  (globalThis as any).__VISUAL_EDITOR_TEST__ === true;

const formatMapStyleLabel = (mapStyle?: string) => {
  const rawStyle = mapStyle ?? "streets-v12";
  return rawStyle
    .replace(/-v\d+$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStaticMapPreviewBackground = (mapStyle?: string) => {
  if (!mapStyle) {
    return "linear-gradient(135deg, #dcfce7 0%, #dbeafe 55%, #fde68a 100%)";
  }

  if (mapStyle.includes("satellite")) {
    return "linear-gradient(135deg, #14532d 0%, #166534 45%, #0369a1 100%)";
  }

  if (mapStyle.includes("navigation-night")) {
    return "linear-gradient(135deg, #111827 0%, #1f2937 55%, #0f766e 100%)";
  }

  if (mapStyle.includes("navigation-day")) {
    return "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #86efac 100%)";
  }

  if (mapStyle.includes("dark")) {
    return "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%)";
  }

  if (mapStyle.includes("light")) {
    return "linear-gradient(135deg, #f8fafc 0%, #e5e7eb 55%, #dbeafe 100%)";
  }

  return "linear-gradient(135deg, #dcfce7 0%, #dbeafe 55%, #fde68a 100%)";
};

const StaticMapTestPreview = ({
  coordinate,
  mapStyle,
  primaryColor,
}: {
  coordinate: Coordinate;
  mapStyle?: string;
  primaryColor: string;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="relative h-[300px] w-full overflow-hidden rounded-lg border border-gray-200"
      style={{ background: getStaticMapPreviewBackground(mapStyle) }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute left-4 top-4 rounded-lg bg-white/85 px-3 py-2 shadow">
        <Body variant="base" className="font-medium text-slate-900">
          {t("map", "Map")}
        </Body>
        <Body variant="sm" className="text-slate-700">
          {formatMapStyleLabel(mapStyle)}
        </Body>
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white shadow-lg"
        style={{ backgroundColor: `#${primaryColor}` }}
      />
      <div className="absolute bottom-3 right-3 rounded bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-700">
        {`${coordinate.latitude.toFixed(3)}, ${coordinate.longitude.toFixed(3)}`}
      </div>
    </div>
  );
};

export const MapboxStaticMapComponent: PuckComponent<MapboxStaticProps> = ({
  apiKey,
  coordinate: coordinateField,
  zoom = 14,
  mapStyle = "light-v11",
  puck,
}) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument<any>();

  const coordinate = resolveComponentData<Coordinate>(
    coordinateField,
    i18n.language,
    streamDocument
  );

  // Show empty state in editor mode when API key is missing
  if (!apiKey) {
    if (puck?.isEditing) {
      return (
        <div
          className={themeManagerCn(
            "relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5"
          )}
        >
          <Map className="w-12 h-12 text-gray-400" />
          <div className="flex flex-col items-center gap-0">
            <Body variant="base" className="text-gray-500 font-medium">
              {pt(
                "staticMapEmptyStateSectionHidden",
                "Section hidden for all locations"
              )}
            </Body>
            <Body variant="base" className="text-gray-500 font-normal">
              {pt(
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

  if (isVisualEditorTestEnv()) {
    return (
      <EntityField
        displayName={pt("coordinate", "Coordinate")}
        fieldId={coordinateField.field}
        constantValueEnabled={coordinateField.constantValueEnabled}
        className="w-full"
      >
        <StaticMapTestPreview
          coordinate={coordinate}
          mapStyle={mapStyle}
          primaryColor={getPrimaryColor(streamDocument)}
        />
      </EntityField>
    );
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
            loading="lazy"
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
            <img
              loading="lazy"
              src={mapboxLogo}
              alt="Mapbox"
              className="w-10"
            />
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
  render: (props) => <MapboxStaticMapComponent {...props} />,
};
