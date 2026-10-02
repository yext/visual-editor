import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { PhoneAtom } from "../atoms/phone.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { TranslatableString } from "../../types/types.ts";
import {
  ThemeColor,
  ThemeOptions,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

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
    /** The color applied to both the phone icon background and the phone link. */
    color?: ThemeColor;
  };

  /** @internal */
  parentData?: {
    field: string;
    phoneNumber?: string;
  };
}

// Phone field definitions used in Phone and CoreInfoSection
export const PhoneDataFields = {
  number: {
    type: "entityField",
    label: msg("fields.phoneNumber", "Phone Number"),
    filter: {
      types: ["type.phone"],
    },
  },
  label: {
    type: "translatableString",
    label: msg("fields.label", "Label"),
    filter: { types: ["type.string"] },
  },
} satisfies YextFields<PhoneProps["data"]>;

// Phone style definitions used in Phone and CoreInfoSection
export const PhoneStyleFields = {
  phoneFormat: {
    label: msg("fields.phoneFormat", "Phone Format"),
    type: "radio",
    options: ThemeOptions.PHONE_OPTIONS,
  },
  // By adding `<boolean>`, we make the type explicit.
  includePhoneHyperlink: {
    label: msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  },
  includeIcon: {
    label: msg("fields.showIcon", "Show Icon"),
    type: "radio",
    options: ThemeOptions.SHOW_HIDE,
  },
  color: {
    type: "basicSelector",
    label: msg("fields.color", "Color"),
    options: "SITE_COLOR",
  },
} satisfies YextFields<PhoneProps["styles"]>;

export const defaultPhoneDataProps: PhoneProps["data"] = {
  number: {
    field: "mainPhone",
    constantValue: "",
  },
  label: { defaultValue: "Phone" },
};

export const PhoneFields = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: PhoneDataFields,
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: PhoneStyleFields,
  },
} satisfies YextFields<PhoneProps>;

const PhoneComponent: typeof Phone.render = ({ data, styles, parentData }) => {
  const resolvedPhone = parentData?.phoneNumber ?? data.number;

  if (!resolvedPhone) {
    return <></>;
  }

  return (
    <EntityField
      displayName={
        parentData ? parentData.field : pt("fields.phoneNumber", "Phone Number")
      }
    >
      <PhoneAtom
        backgroundColor={styles.color ?? backgroundColors.background2.value}
        eventName={`phone`}
        format={styles.phoneFormat}
        label={data.label}
        phoneNumber={resolvedPhone}
        includeHyperlink={styles.includePhoneHyperlink}
        includeIcon={styles.includeIcon ?? true}
        linkColor={styles.color}
      />
    </EntityField>
  );
};

export const Phone: YextComponentConfig<PhoneProps, typeof PhoneFields> = {
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
  render: PhoneComponent,
};
