// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { AddressType, Coordinate, getDirections } from "@yext/pages-components";
import {
  EntityField,
  TranslatableString,
  YextEntityField,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiMapSurfaceSlotProps {
  data: {
    apiKey: string;
    coordinate: YextEntityField<Coordinate>;
    address: YextEntityField<AddressType>;
    directionsText: TranslatableString;
  };
  styles: {
    mapStyle: string;
    showDirectionsAction: boolean;
  };
}

const fields: Fields<YetiMapSurfaceSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      apiKey: YextField("API Key", { type: "text" }),
      coordinate: YextField("Coordinate", {
        type: "entityField",
        filter: { types: ["type.coordinate"] },
      }),
      address: YextField("Address", {
        type: "entityField",
        filter: { types: ["type.address"] },
      }),
      directionsText: YextField("Directions Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      mapStyle: YextField("Map Style", {
        type: "select",
        options: [
          { label: "Default", value: "streets-v12" },
          { label: "Satellite", value: "satellite-streets-v12" },
          { label: "Light", value: "light-v11" },
          { label: "Dark", value: "dark-v11" },
        ],
      }),
      showDirectionsAction: YextField("Show Directions Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
};

const YetiMapSurfaceSlotComponent: PuckComponent<YetiMapSurfaceSlotProps> = ({
  data,
  styles,
  puck,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const coordinate = resolveComponentData(
    data.coordinate,
    i18n.language,
    streamDocument
  ) as Coordinate | undefined;
  const address = resolveComponentData(
    data.address,
    i18n.language,
    streamDocument
  ) as AddressType | undefined;
  const directionsText = resolveComponentData(
    data.directionsText,
    i18n.language,
    streamDocument
  );

  const directionsLink =
    address && (address.line1 || address.city || address.region)
      ? getDirections(address, undefined, undefined, { provider: "google" })
      : undefined;

  const latitude = coordinate?.latitude ?? 0;
  const longitude = coordinate?.longitude ?? 0;
  const hasCoordinate = Number.isFinite(latitude) && Number.isFinite(longitude);
  const mapImageUrl =
    data.apiKey && hasCoordinate
      ? `https://api.mapbox.com/styles/v1/mapbox/${styles.mapStyle}/static/pin-l+111(${longitude},${latitude})/${longitude},${latitude},14/1280x720?access_token=${data.apiKey}&logo=false&attribution=false`
      : "";

  return (
    <div className="flex w-full flex-col gap-3">
      {mapImageUrl ? (
        <EntityField
          displayName="Coordinate"
          fieldId={data.coordinate.field}
          constantValueEnabled={data.coordinate.constantValueEnabled}
          className="w-full"
        >
          <img
            src={mapImageUrl}
            alt="Map"
            className="h-[360px] w-full border border-black/20 object-cover"
            loading="lazy"
          />
        </EntityField>
      ) : puck.isEditing ? (
        <div className="h-[360px] w-full border border-black/20 bg-neutral-200" />
      ) : null}
      {styles.showDirectionsAction && directionsText && directionsLink ? (
        <a
          href={directionsLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center border border-current px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
        >
          {directionsText}
        </a>
      ) : null}
    </div>
  );
};

export const defaultYetiMapSurfaceSlotProps: YetiMapSurfaceSlotProps = {
  data: {
    apiKey: "",
    coordinate: {
      field: "yextDisplayCoordinate",
      constantValue: {
        latitude: 0,
        longitude: 0,
      },
      constantValueEnabled: false,
    },
    address: {
      field: "address",
      constantValue: {
        line1: "",
        city: "",
        region: "",
        postalCode: "",
        countryCode: "US",
      },
      constantValueEnabled: false,
    },
    directionsText: toTranslatableString("Get Directions"),
  },
  styles: {
    mapStyle: "streets-v12",
    showDirectionsAction: true,
  },
};

export const YetiMapSurfaceSlot: ComponentConfig<{
  props: YetiMapSurfaceSlotProps;
}> = {
  label: "Yeti Map Surface Slot",
  fields,
  defaultProps: defaultYetiMapSurfaceSlotProps,
  render: (props) => <YetiMapSurfaceSlotComponent {...props} />,
};
