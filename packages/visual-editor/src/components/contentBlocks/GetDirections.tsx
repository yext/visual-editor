import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { getDirections, Coordinate } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  EntityField,
  CTA,
  CTAProps,
  YextField,
} from "@yext/visual-editor";

export type GetDirectionsProps = {
  coordinate: YextEntityField<Coordinate>;
  variant: CTAProps["variant"];
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  coordinate: YextField<any, Coordinate>("Coordinates", {
    type: "entityField",
    filter: { types: ["type.coordinate"] },
  }),
  variant: YextField("Variant", {
    type: "radio",
    options: "CTA_VARIANT",
  }),
};

const GetDirectionsComponent = ({
  variant,
  coordinate: coordinateField,
}: GetDirectionsProps) => {
  const document = useDocument();
  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    coordinateField
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
      displayName="Get Directions"
      fieldId={coordinateField.field}
      constantValueEnabled={coordinateField.constantValueEnabled}
    >
      <CTA
        label={"Get Directions"}
        link={searchQuery || "#"}
        linkType={"DRIVING_DIRECTIONS"}
        variant={variant}
      />
    </EntityField>
  );
};

export const GetDirections: ComponentConfig<GetDirectionsProps> = {
  label: "Get Directions",
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
