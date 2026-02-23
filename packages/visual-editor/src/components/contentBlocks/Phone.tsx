import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@puckeditor/core";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { PhoneAtom } from "../atoms/phone.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { YextField } from "../../editor/YextField.tsx";
import { TranslatableString } from "../../types/types.ts";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { defaultText } from "../../utils/i18n/defaultContent.ts";

/** The props for the Phone component */
export interface PhoneProps {
  data: {
    /** The phone number data to display */
    number: YextEntityField<string>;
    /** The text to display before the phone number */
    label: TranslatableString;
  };

  styles: {
    /** Whether to format the phone number like a domestic or international number */
    phoneFormat: "domestic" | "international";
    /** Whether to make the phone number a clickable link */
    includePhoneHyperlink: boolean;
    /** Whether to include the phone icon, defaults to true */
    includeIcon?: boolean;
  };

  /** @internal */
  parentData?: {
    field: string;
    phoneNumber: string;
  };
}

// Phone field definitions used in Phone and CoreInfoSection
export const PhoneDataFields = {
  number: YextField<any, string>(msg("fields.phoneNumber", "Phone Number"), {
    type: "entityField",
    filter: {
      types: ["type.phone"],
    },
  }),
  label: YextField<TranslatableString>(msg("fields.label", "Label"), {
    type: "translatableString",
    filter: { types: ["type.string"] },
  }),
};

// Phone style definitions used in Phone and CoreInfoSection
export const PhoneStyleFields = {
  phoneFormat: YextField<"domestic" | "international">(
    msg("fields.phoneFormat", "Phone Format"),
    {
      type: "radio",
      options: "PHONE_OPTIONS",
    }
  ),
  // By adding `<boolean>`, we make the type explicit.
  includePhoneHyperlink: YextField<boolean>(
    msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
  includeIcon: YextField(msg("fields.showIcon", "Show Icon"), {
    type: "radio",
    options: "SHOW_HIDE",
  }),
};

export const defaultPhoneDataProps: PhoneProps["data"] = {
  number: {
    field: "mainPhone",
    constantValue: "",
  },
  label: defaultText("componentDefaults.phone", "Phone"),
};

export const PhoneFields: Fields<PhoneProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: PhoneDataFields,
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: PhoneStyleFields,
  }),
};

const PhoneComponent = ({ data, styles, parentData }: PhoneProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedPhone = parentData
    ? parentData.phoneNumber
    : resolveComponentData(data.number, i18n.language, streamDocument);

  if (!resolvedPhone) {
    return;
  }

  return (
    <EntityField
      displayName={
        parentData ? parentData.field : pt("fields.phoneNumber", "Phone Number")
      }
      fieldId={data.number.field}
      constantValueEnabled={!parentData && data.number.constantValueEnabled}
    >
      <PhoneAtom
        backgroundColor={backgroundColors.background2.value}
        eventName={`phone`}
        format={styles.phoneFormat}
        label={resolveComponentData(data.label, i18n.language, streamDocument)}
        phoneNumber={resolvedPhone}
        includeHyperlink={styles.includePhoneHyperlink}
        includeIcon={styles.includeIcon ?? true}
      />
    </EntityField>
  );
};

export const Phone: ComponentConfig<{ props: PhoneProps }> = {
  label: msg("components.phone", "Phone"),
  fields: PhoneFields,
  defaultProps: {
    data: defaultPhoneDataProps,
    styles: {
      phoneFormat: "domestic",
      includePhoneHyperlink: true,
      includeIcon: true,
    },
  },
  resolveFields: (data) => resolveDataFromParent(PhoneFields, data),
  render: (props) => <PhoneComponent {...props} />,
};
