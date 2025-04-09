import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  PhoneAtom,
} from "../../index.js";

export interface PhoneProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

const PhoneFields: Fields<PhoneProps> = {
  phone: YextEntityFieldSelector({
    label: "Phone Number",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: {
    label: "Format",
    type: "radio",
    options: [
      { label: "Domestic", value: "domestic" },
      { label: "International", value: "international" },
    ],
  },
  includeHyperlink: {
    label: "Include Hyperlink",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const PhoneComponent: React.FC<PhoneProps> = ({
  phone,
  format,
  includeHyperlink,
}) => {
  const document = useDocument();
  const resolvedPhone = resolveYextEntityField<string>(document, phone);

  if (!resolvedPhone) {
    return;
  }

  return (
    <EntityField
      displayName="Phone"
      fieldId={phone.field}
      constantValueEnabled={phone.constantValueEnabled}
    >
      <PhoneAtom
        phoneNumber={resolvedPhone}
        format={format}
        includeHyperlink={includeHyperlink}
      />
    </EntityField>
  );
};

export const Phone: ComponentConfig<PhoneProps> = {
  label: "Phone",
  fields: PhoneFields,
  defaultProps: {
    phone: {
      field: "mainPhone",
      constantValue: "",
    },
    includeHyperlink: true,
  },
  render: (props) => <PhoneComponent {...props} />,
};
