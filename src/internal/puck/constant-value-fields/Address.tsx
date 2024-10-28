import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";
import { AddressType } from "@yext/pages-components";

export const ADDRESS_CONSTANT_CONFIG: CustomField<AddressType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return (
      <>
        <FieldLabel label="Line 1" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.line1}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                line1: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="Line 2" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.line2}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                line2: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="Line 3" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.line3}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                line3: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="City" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.city}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                city: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="State/Region" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.region}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                region: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="Sublocality" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.sublocality}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                sublocality: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="Postal Code" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.postalCode}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                postalCode: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label="Country Code" className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.countryCode}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                countryCode: fieldValue,
              });
            }}
          />
        </FieldLabel>
      </>
    );
  },
};
