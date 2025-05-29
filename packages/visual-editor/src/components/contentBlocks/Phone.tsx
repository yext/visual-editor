import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  PhoneAtom,
  YextField,
  i18n,
} from "@yext/visual-editor";

export interface PhoneProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

const PhoneFields: Fields<PhoneProps> = {
  phone: YextField(i18n("Phone Number"), {
    type: "entityField",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: YextField(i18n("Format"), {
    type: "radio",
    options: "PHONE_OPTIONS",
  }),
  includeHyperlink: YextField(i18n("Include Hyperlink"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
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
      displayName={i18n("Phone")}
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
  label: i18n("Phone"),
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
