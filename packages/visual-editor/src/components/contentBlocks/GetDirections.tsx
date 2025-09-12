import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import { getDirections, Coordinate } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  YextEntityField,
  useDocument,
  EntityField,
  CTA,
  CTAVariant,
  YextField,
  pt,
  msg,
  resolveComponentData,
} from "@yext/visual-editor";

export type GetDirectionsProps = {
  coordinate: YextEntityField<Coordinate>;
  variant: CTAVariant;
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  coordinate: YextField<any, Coordinate>(
    msg("fields.coordinates", "Coordinates"),
    {
      type: "entityField",
      filter: { types: ["type.coordinate"] },
    }
  ),
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
};

const GetDirectionsComponent = ({
  variant,
  coordinate: coordinateField,
}: GetDirectionsProps) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();
  const coordinate = resolveComponentData(
    coordinateField,
    i18n.language,
    streamDocument
  );
  if (!coordinate) {
    console.warn("yextDisplayCoordinate is not present in the stream");
  }

  const searchQuery = getDirections(
    undefined,
    undefined,
    undefined,
    { provider: "google" },
    coordinate
  );

  return (
    <EntityField
      displayName={pt("getDirections", "Get Directions")}
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
    >
      <CTA
        className="font-bold"
        eventName={`getDirections`}
        label={t("getDirections", "Get Directions")}
        link={searchQuery}
        linkType={"DRIVING_DIRECTIONS"}
        target="_blank"
        variant={variant}
      />
    </EntityField>
  );
};

export const GetDirections: ComponentConfig<{ props: GetDirectionsProps }> = {
  label: msg("components.getDirections", "Get Directions"),
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
    coordinate: {
      field: "yextDisplayCoordinate",
      constantValue: {
        latitude: 0,
        longitude: 0,
      },
    },
  },
  render: (props) => <GetDirectionsComponent {...props} />,
};
