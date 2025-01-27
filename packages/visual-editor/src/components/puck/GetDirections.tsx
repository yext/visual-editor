import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Button, ButtonProps } from "./atoms/button.js";
import {
  getDirections,
  GetDirectionsConfig,
  Link,
  Coordinate,
} from "@yext/pages-components";
import "@yext/pages-components/style.css";
import {
  YextEntityField,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  FontSizeSelector,
  EntityField,
  getBorderRadiusOptions,
} from "../../index.js";

type GetDirectionsProps = {
  coordinate: YextEntityField<Coordinate>;
  getDirectionsProvider: GetDirectionsConfig["provider"];
  variant: ButtonProps["variant"];
  size: ButtonProps["size"];
  borderRadius: ButtonProps["borderRadius"];
  fontSize: ButtonProps["fontSize"];
};

const getDirectionsFields: Fields<GetDirectionsProps> = {
  coordinate: YextEntityFieldSelector<any, Coordinate>({
    label: "Get Directions",
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
      { label: "Primary", value: "primary" },
      { label: "Link", value: "link" },
    ],
  },
  size: {
    label: "Size",
    type: "radio",
    options: [
      { label: "Small", value: "small" },
      { label: "Large", value: "large" },
    ],
  },
  fontSize: FontSizeSelector(),
  borderRadius: {
    label: "Border Radius",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      ...getBorderRadiusOptions(),
    ],
  },
};

const GetDirections = ({
  variant,
  size,
  borderRadius,
  coordinate: coordinateField,
  getDirectionsProvider,
  fontSize,
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
      <Button
        asChild
        variant={variant}
        size={size}
        fontSize={fontSize}
        borderRadius={borderRadius}
      >
        <Link href={searchQuery ?? "#"}>{"Get Directions"}</Link>
      </Button>
    </EntityField>
  );
};

const GetDirectionsComponent: ComponentConfig<GetDirectionsProps> = {
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
    size: "small",
    fontSize: "default",
    borderRadius: "default",
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
