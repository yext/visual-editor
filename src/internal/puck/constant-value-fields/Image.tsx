import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";

export const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return (
      <>
        <FieldLabel
          label={"Alternate Text"}
          className="ve-inline-block ve-pt-4"
        >
          <AutoField
            field={{ type: "text" }}
            value={value.alternateText}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                alternateText: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label={"Height"} className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "number" }}
            value={value.height}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                height: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label={"Width"} className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "number" }}
            value={value.width}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                width: fieldValue,
              });
            }}
          />
        </FieldLabel>
        <FieldLabel label={"URL"} className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.url}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                url: fieldValue,
              });
            }}
          />
        </FieldLabel>
      </>
    );
  },
};
