import React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  AddressType,
  getDirections,
  GetDirectionsConfig,
  Link,
  Address as RenderAddress,
} from "@yext/pages-components";
import { Section, sectionVariants } from "./atoms/section.tsx";
import "@yext/pages-components/style.css";
import { VariantProps } from "class-variance-authority";
import { config } from "process";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField.ts";
import { EntityField } from "../editor/EntityField.tsx";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../editor/YextEntityFieldSelector.tsx";

export type AddressProps = {
  address: YextEntityField<AddressType>;
  getDirectionsProvider: GetDirectionsConfig["provider"];
  alignment: "items-start" | "items-center";
  padding: VariantProps<typeof sectionVariants>["padding"];
};

const addressFields: Fields<AddressProps> = {
  address: YextEntityFieldSelector<typeof config, AddressType>({
    label: "Address",
    filter: { types: ["type.address"] },
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

const Address = ({
  alignment,
  padding,
  address: addressField,
  getDirectionsProvider,
}: AddressProps) => {
  const document = useDocument();
  const address = resolveYextEntityField(document, addressField);
  const coordinates = getDirections(
    address as AddressType,
    undefined,
    undefined,
    { provider: getDirectionsProvider }
  );

  return (
    <Section
      className={`flex flex-col justify-center components ${alignment} font-body-fontWeight text-body-fontSize text-body-color`}
      padding={padding}
    >
      {address && (
        <div>
          <EntityField
            displayName="Address"
            fieldId={
              addressField.constantValueEnabled ? "constant value" : "address"
            }
          >
            <RenderAddress
              address={address as AddressType}
              lines={[["line1"], ["line2", "city", "region", "postalCode"]]}
            />
            {coordinates && (
              <Link
                cta={{
                  link: coordinates,
                  label: "Get Directions",
                  linkType: "URL",
                }}
                target="_blank"
                className="font-bold text-palette-primary underline hover:no-underline md:px-4;"
              />
            )}
          </EntityField>
        </div>
      )}
    </Section>
  );
};

export const AddressComponent: ComponentConfig<AddressProps> = {
  fields: addressFields,
  defaultProps: {
    alignment: "items-start",
    padding: "none",
    getDirectionsProvider: "google",
    address: {
      field: "address",
      constantValue: {
        line1: "",
        city: "",
        region: "",
        postalCode: "",
        countryCode: "",
      },
    },
  },
  label: "Address",
  render: (props) => <Address {...props} />,
};