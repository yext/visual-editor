import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  CTA,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";

export interface GetDirectionsProps {
  label: YextEntityField<TranslatableString>;
  address: YextEntityField<any>;
}

const getDirectionsFields: Fields<GetDirectionsProps> = {
  label: YextField<any, TranslatableString>("Label", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  address: YextField<any, any>("Address", {
    type: "entityField",
    filter: { types: ["type.address"] },
  }),
};

const GetDirectionsComponent = ({ label, address }: GetDirectionsProps) => {
  const { t, i18n } = useTranslation();
  const document = useDocument();
  const addressData = resolveYextEntityField(document, address);
  const labelText = resolveTranslatableString(
    resolveYextEntityField(document, label),
    i18n.language,
  );

  const getDirectionsUrl = addressData
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${addressData.line1 || ""} ${addressData.city || ""} ${addressData.region || ""} ${addressData.postalCode || ""}`,
      )}`
    : "#";

  return (
    <EntityField
      displayName={t("getDirections", "Get Directions")}
      fieldId={label.field}
      constantValueEnabled={label.constantValueEnabled}
    >
      <CTA
        label={labelText || "Get Directions"}
        link={getDirectionsUrl}
        linkType="DRIVING_DIRECTIONS"
        target="_blank"
        variant="primary"
      />
    </EntityField>
  );
};

export const GetDirections: ComponentConfig<GetDirectionsProps> = {
  label: "Get Directions",
  fields: getDirectionsFields,
  defaultProps: {
    label: {
      field: "",
      constantValue: "Get Directions",
      constantValueEnabled: true,
    },
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
  render: (props) => <GetDirectionsComponent {...props} />,
};
