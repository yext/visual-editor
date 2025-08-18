import { useTranslation } from "react-i18next";
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
  TranslatableString,
  backgroundColors,
} from "@yext/visual-editor";

export interface PhoneProps {
  data: {
    phone: YextEntityField<string>;
    label: TranslatableString;
  };
  styles: {
    format: "domestic" | "international";
    includeHyperlink: boolean;
  };
}

const PhoneFields: Fields<PhoneProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      phone: YextField(msg("fields.phoneNumber", "Phone Number"), {
        type: "entityField",
        filter: {
          types: ["type.phone"],
        },
      }),
      label: YextField(msg("fields.label", "Label"), {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
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
    },
  }),
};

const PhoneComponent = ({ data, styles }: PhoneProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedPhone = resolveComponentData(
    data.phone,
    i18n.language,
    streamDocument
  );

  if (!resolvedPhone) {
    return;
  }

  return (
    <EntityField
      displayName={pt("fields.phoneNumber", "Phone Number")}
      fieldId={data.phone.field}
      constantValueEnabled={data.phone.constantValueEnabled}
    >
      <PhoneAtom
        backgroundColor={backgroundColors.background2.value}
        eventName={`phone`}
        format={styles.format}
        label={resolveComponentData(data.label, i18n.language, streamDocument)}
        phoneNumber={resolvedPhone}
        includeHyperlink={styles.includeHyperlink}
        includeIcon={true}
      />
    </EntityField>
  );
};

export const Phone: ComponentConfig<PhoneProps> = {
  label: msg("components.phone", "Phone"),
  fields: PhoneFields,
  defaultProps: {
    data: {
      phone: {
        field: "mainPhone",
        constantValue: "",
      },
      label: {
        en: "Phone",
        hasLocalizedValue: "true",
      },
    },
    styles: {
      format: "domestic",
      includeHyperlink: true,
    },
  },
  render: (props) => <PhoneComponent {...props} />,
};
