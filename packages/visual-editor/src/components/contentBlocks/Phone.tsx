import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  PhoneAtom,
  msg,
  pt,
  YextField,
} from "@yext/visual-editor";

export interface PhoneProps {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  includeHyperlink: boolean;
}

const PhoneFields: Fields<PhoneProps> = {
  phone: YextField(msg("fields.phoneNumber", "Phone Number"), {
    type: "entityField",
    filter: {
      types: ["type.phone"],
    },
  }),
  format: YextField(msg("fields.format", "Format"), {
    type: "radio",
    options: "PHONE_OPTIONS",
  }),
  includeHyperlink: YextField(
    msg("fields.includeHyperlink", "Include Hyperlink"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
};

const PhoneComponent: React.FC<PhoneProps> = ({
  phone,
  format,
  includeHyperlink,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedPhone = resolveComponentData(
    phone,
    i18n.language,
    streamDocument
  );

  if (!resolvedPhone) {
    return;
  }

  return (
    <EntityField
      displayName={pt("phone", "Phone")}
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
  label: msg("components.phone", "Phone"),
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
