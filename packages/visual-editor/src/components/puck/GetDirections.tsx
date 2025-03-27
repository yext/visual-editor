import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { ButtonProps } from "./atoms/button.js";
import { getDirections, Coordinate } from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  YextEntityField,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  EntityField,
  CTA,
} from "../../index.js";

type GetDirectionsProps = {
  coordinate: YextEntityField<Coordinate>;
  variant: ButtonProps["variant"];
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  coordinate: YextEntityFieldSelector<any, Coordinate>({
    label: "Coordinates",
    filter: { types: ["type.coordinate"] },
  }),
  variant: {
    label: "Variant",
    type: "radio",
    options: [
      { label: "Button", value: "primary" },
      { label: "Link", value: "link" },
    ],
  },
};

const GetDirections = ({
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
        size={"small"}
        variant={variant}
      />
    </EntityField>
  );
};

const GetDirectionsComponent: ComponentConfig<GetDirectionsProps> = {
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
  label: "Get Directions",
  render: (props: GetDirectionsProps) => <GetDirections {...props} />,
};

export { GetDirectionsComponent as GetDirections, type GetDirectionsProps };
