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
  BasicSelector,
} from "../../index.js";
import { Phone as PhoneIcon } from "lucide-react";
import parsePhoneNumber from "libphonenumber-js";
import { Link } from "@yext/pages-components";

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
      includeHyperlink: {
        true: "underline hover:no-underline",
        false: "",
      },
    },
    defaultVariants: {
      fontWeight: "default",
      color: "default",
      includeHyperlink: true,
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
  const parsedPhoneNumber = parsePhoneNumber(phoneNumberString);
  if (!parsedPhoneNumber) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.formatInternational()
    : parsedPhoneNumber.formatNational();
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
  color: BasicSelector("Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
  includeHyperlink: {
    label: "Include Hyperlink",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

const Phone: React.FC<PhoneProps> = ({
  phone,
  format,
  fontWeight,
  color,
  includeHyperlink,
}) => {
  const document = useDocument();
  const resolvedPhone = resolveYextEntityField<string>(document, phone);

  if (!resolvedPhone) {
    return;
  }

  const formattedPhoneNumber: string = formatPhoneNumber(resolvedPhone, format);
  const classNameCn = phoneVariants({ fontWeight, color, includeHyperlink });

  return (
    <EntityField
      displayName="Phone"
      fieldId={phone.field}
      constantValueEnabled={phone.constantValueEnabled}
    >
      <p className={classNameCn}>
        <PhoneIcon className="w-4 h-4" />
        {includeHyperlink ? (
          <Link
            cta={{
              link: resolvedPhone,
              label: formattedPhoneNumber,
              linkType: "PHONE",
            }}
            className={classNameCn}
          />
        ) : (
          <span>{formattedPhoneNumber}</span>
        )}
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
    includeHyperlink: true,
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-body-fontFamily`,
    });
    return {
      ...PhoneFields,
      fontWeight: BasicSelector("Font Weight", fontWeightOptions),
    };
  },
  render: (props) => <Phone {...props} />,
};

export { PhoneComponent as Phone, type PhoneProps };
