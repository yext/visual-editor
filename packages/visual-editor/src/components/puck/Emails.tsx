import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { cva, type VariantProps } from "class-variance-authority";
import mailIcon from "./assets/mail_outline.svg";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
  FontSizeSelector,
} from "../../index.js";
import { Link } from "@yext/pages-components";
import { BasicSelector } from "../editor/BasicSelector.js";

const emailsVariants = cva("components list-inside font-body-fontFamily", {
  variants: {
    fontSize: {
      default: "",
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
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
      default: "",
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
  compoundVariants: [
    {
      includeHyperlink: true,
      fontSize: "default",
      className: "text-link-fontSize",
    },
    {
      includeHyperlink: false,
      fontSize: "default",
      className: "text-body-fontSize",
    },
    {
      includeHyperlink: true,
      color: "default",
      className: "text-link-color",
    },
    {
      includeHyperlink: false,
      color: "default",
      className: "text-body-color",
    },
  ],
  defaultVariants: {
    fontSize: "default",
    fontWeight: "default",
    color: "default",
    includeHyperlink: true,
  },
});

interface EmailsProps extends VariantProps<typeof emailsVariants> {
  list: YextEntityField<string[]>;
  listLength: number;
}

const EmailsFields: Fields<EmailsProps> = {
  list: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
      allowList: ["emails"],
      includeListsOnly: true,
    },
  }),
  fontSize: FontSizeSelector("Font Size", false),
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
  listLength: {
    type: "number",
    label: "List Length",
    min: 1,
    max: 100,
  },
};

const Emails: React.FC<EmailsProps> = ({
  list: emailListField,
  fontSize,
  fontWeight,
  color,
  includeHyperlink,
  listLength,
}) => {
  const document = useDocument();
  let resolvedEmailList: any = resolveYextEntityField(document, emailListField);
  if (!resolvedEmailList) {
    resolvedEmailList = [
      "sample_email1@gmail.com",
      "sample_email2@yahoo.com",
      "sample_email3@msn.com",
    ];
  } else if (!Array.isArray(resolvedEmailList)) {
    resolvedEmailList = [resolvedEmailList];
  }

  const classNameCn = themeManagerCn(
    emailsVariants({ fontSize, fontWeight, color, includeHyperlink })
  );

  return (
    <EntityField
      displayName="Email List"
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul className={classNameCn}>
        {resolvedEmailList
          .slice(0, Math.min(resolvedEmailList.length, listLength))
          .map((text: any, index: any) => (
            <li key={index} className={`mb-2 flex items-center`}>
              <img className={"mr-2"} src={mailIcon} />
              {includeHyperlink ? (
                <Link
                  cta={{
                    link: text,
                    label: text,
                    linkType: "Email",
                  }}
                  className={classNameCn}
                />
              ) : (
                <span>{text}</span>
              )}
            </li>
          ))}
      </ul>
    </EntityField>
  );
};

const EmailsComponent: ComponentConfig<EmailsProps> = {
  label: "Emails",
  fields: EmailsFields,
  defaultProps: {
    list: {
      field: "emails",
      constantValue: [],
    },
    includeHyperlink: true,
    listLength: 5,
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-body-fontFamily`,
    });
    return {
      ...EmailsFields,
      fontWeight: BasicSelector("Font Weight", fontWeightOptions),
    };
  },
  render: (props) => <Emails {...props} />,
};

export { EmailsComponent as Emails, type EmailsProps };
