import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  Phone,
  ThemeOptions,
} from "../../index.js";

export interface PhoneWrapperProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

const PhoneFields: Fields<PhoneWrapperProps> = {
  phone: YextEntityFieldSelector({
    label: "Phone Number",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: {
    label: "Format",
    type: "radio",
    options: ThemeOptions.PHONE_OPTIONS,
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

const PhoneComponent: React.FC<PhoneWrapperProps> = ({
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
      <Phone
        phoneNumber={resolvedPhone}
        format={format}
        includeHyperlink={includeHyperlink}
      />
    </EntityField>
  );
};

export const PhoneWrapper: ComponentConfig<PhoneWrapperProps> = {
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
