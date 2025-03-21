import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { ButtonProps } from "./atoms/button.js";
import {
  getDirections,
  GetDirectionsConfig,
  Coordinate,
} from "@yext/pages-components";
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
  getDirectionsProvider: GetDirectionsConfig["provider"];
  variant: ButtonProps["variant"];
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  coordinate: YextEntityFieldSelector<any, Coordinate>({
    label: "CTA",
    filter: { types: ["type.coordinate"] },
  }),
  getDirectionsProvider: {
    label: "Maps Provider",
    type: "radio",
    options: [
      { label: "Google", value: "google" },
      { label: "Apple", value: "apple" },
      { label: "Bing", value: "bing" },
    ],
  },
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
  getDirectionsProvider,
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
    { provider: getDirectionsProvider },
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
    getDirectionsProvider: "google",
    coordinate: {
      field: "yextDisplayCoordinate",
      constantValue: {
        latitude: 0,
        longitude: 0,
      },
    },
  },
  label: "Get Directions",
  render: (props) => <GetDirections {...props} />,
};

export { GetDirectionsComponent as GetDirections, type GetDirectionsProps };
