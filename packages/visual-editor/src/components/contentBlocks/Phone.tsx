import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  PhoneAtom,
  YextField,
  useI18n,
} from "@yext/visual-editor";

export interface PhoneProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

const PhoneFields: Fields<PhoneProps> = {
  phone: YextField("Phone Number", {
    type: "entityField",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: YextField("Format", {
    type: "radio",
    options: "PHONE_OPTIONS",
  }),
  includeHyperlink: YextField("Include Hyperlink", {
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }),
};

const PhoneComponent: React.FC<PhoneProps> = ({
  phone,
  format,
  includeHyperlink,
}) => {
  const document = useDocument();
  const i18n = useI18n();
  const resolvedPhone = resolveYextEntityField<string>(document, phone);

  if (!resolvedPhone) {
    return;
  }

  return (
    <EntityField
      displayName={i18n("phone", { defaultValue: "Phone" })}
      fieldId={phone.field}
      constantValueEnabled={phone.constantValueEnabled}
    >
      <PhoneAtom
        phoneNumber={resolvedPhone}
        format={format}
        includeHyperlink={includeHyperlink}
        includeIcon={true}
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
