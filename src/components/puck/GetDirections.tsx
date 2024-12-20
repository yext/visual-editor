import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Section, sectionVariants } from "./atoms/section.js";
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
} from "../../index.js";
import { VariantProps } from "class-variance-authority";

type GetDirectionsProps = {
  coordinate: YextEntityField<Coordinate>;
  getDirectionsProvider: GetDirectionsConfig["provider"];
  variant: ButtonProps["variant"];
  size: ButtonProps["size"];
  borderRadius: ButtonProps["borderRadius"];
  alignment: "items-start" | "items-center";
  padding: VariantProps<typeof sectionVariants>["padding"];
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
      { label: "Default", value: "default" },
      { label: "Small", value: "small" },
      { label: "Large", value: "large" },
    ],
  },
  fontSize: FontSizeSelector(),
  borderRadius: {
    label: "Border Radius",
    type: "radio",
    options: [
      { label: "Default", value: "default" },
      { label: "None", value: "none" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" },
      { label: "Full", value: "full" },
    ],
  },
  alignment: {
    label: "Align card",
    type: "radio",
    options: [
      { label: "Left", value: "items-start" },
      { label: "Center", value: "items-center" },
    ],
  },
  padding: {
    label: "Padding",
    type: "radio",
    options: [
      { label: "None", value: "none" },
      { label: "Small", value: "small" },
      { label: "Medium", value: "default" },
      { label: "Large", value: "large" },
    ],
  },
};

const GetDirections = ({
  variant,
  size,
  borderRadius,
  alignment,
  padding,
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
    <Section
      className={`flex flex-col justify-center components ${alignment} font-body-fontFamily font-body-fontWeight text-body-fontSize text-body-color`}
      padding={padding}
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
    </Section>
  );
};

const GetDirectionsComponent: ComponentConfig<GetDirectionsProps> = {
  fields: getDirectionsFields,
  defaultProps: {
    variant: "primary",
    size: "default",
    fontSize: "default",
    borderRadius: "default",
    alignment: "items-start",
    padding: "none",
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
