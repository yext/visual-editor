import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { cva, type VariantProps } from "class-variance-authority";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
} from "../../index.js";
import { Phone as PhoneIcon } from "lucide-react";

const phoneVariants = cva(
  "components flex gap-2 items-center text-body-fontSize font-body-fontFamily",
  {
    variants: {
      fontWeight: {
        default: "font-body-fontWeight",
        "100": "font-thin",
        "200": "font-extralight",
        "300": "font-light",
        "400": "font-normal",
        "500": "font-medium",
        "600": "font-semibold",
        "700": "font-bold",
        "800": "font-extrabold",
        "900": "font-black",
      },
      color: {
        default: "text-body-color",
        primary: "text-palette-primary",
        secondary: "text-palette-secondary",
        accent: "text-palette-accent",
        text: "text-palette-text",
        background: "text-palette-background",
      },
    },
    defaultVariants: {
      fontWeight: "default",
      color: "default",
    },
  }
);

interface PhoneProps extends VariantProps<typeof phoneVariants> {
  phone: YextEntityField<string>;
  format?: "domestic" | "international";
  textSize?: number;
}

/*
 * formatPhoneNumber formats a phone number into one of the following forms,
 * depending on whether format is set to domestic or international:
 * (123) 456-7890 or +1 (123) 456-7890. A variety of 1-3 digit international
 * codes are accepted. If formatting fails, the original string is returned.
 */
const formatPhoneNumber = (
  phoneNumberString: string,
  format: string = "domestic"
): string => {
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  const match = cleaned.match(/^(?:\+?(\d{1,3}))?(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    const countryCode = match[1] ? `+${match[1]} ` : "";
    return format === "international"
      ? `${countryCode}(${match[2]}) ${match[3]}-${match[4]}`
      : `(${match[2]}) ${match[3]}-${match[4]}`;
  }

  return phoneNumberString;
};

const PhoneFields: Fields<PhoneProps> = {
  phone: YextEntityFieldSelector({
    label: "Entity Field",
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
  fontWeight: {
    label: "Font Weight",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Thin", value: "thin" },
      { label: "Extra Light", value: "extralight" },
      { label: "Light", value: "light" },
      { label: "Normal", value: "normal" },
      { label: "Medium", value: "medium" },
      { label: "Semibold", value: "semibold" },
      { label: "Bold", value: "bold" },
      { label: "Extrabold", value: "extrabold" },
      { label: "Black", value: "black" },
    ],
  },
  color: {
    label: "Color",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Accent", value: "accent" },
      { label: "Text", value: "text" },
      { label: "Background", value: "background" },
    ],
  },
};

const Phone: React.FC<PhoneProps> = ({ phone, format, fontWeight, color }) => {
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
      <p className={phoneVariants({ fontWeight, color })}>
        <PhoneIcon className="w-4 h-4" />
        {formatPhoneNumber(resolvedPhone, format)}
      </p>
    </EntityField>
  );
};

const PhoneComponent: ComponentConfig<PhoneProps> = {
  label: "Phone",
  fields: PhoneFields,
  defaultProps: {
    textSize: 16,
    phone: {
      field: "mainPhone",
      constantValue: "",
    },
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-body-fontFamily`,
    });
    return {
      ...PhoneFields,
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: fontWeightOptions,
      },
    };
  },
  render: (props) => <Phone {...props} />,
};

export { PhoneComponent as Phone, type PhoneProps };
