import React from "react";
import { CustomField, FieldLabel, AutoField } from "@measured/puck";
import { CTAProps } from "../../../components/puck/atoms/cta.tsx";

export const CTA_CONSTANT_CONFIG: CustomField<CTAProps> = {
  type: "custom",
  render: ({ onChange, value }) => {
    return (
      <>
        <FieldLabel label={"Label"} className="ve-inline-block ve-pt-4">
          <AutoField
            field={{ type: "text" }}
            value={value.name}
            onChange={(fieldValue) => {
              onChange({
                ...value,
                name: fieldValue,
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
