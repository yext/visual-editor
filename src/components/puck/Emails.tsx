import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { cva, type VariantProps } from "class-variance-authority";
import mailIcon from "./assets/mail_outline.svg";
import {
  themeMangerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
} from "../../index.js";

const emailsVariants = cva("list-inside font-body-fontFamily", {
  variants: {
    fontSize: {
      default: "text-body-fontSize",
      xs: "text-xs",
      sm: "text-sm",
      medium: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl",
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
      default: "text-body-color",
      primary: "text-palette-primary",
      secondary: "text-palette-secondary",
      accent: "text-palette-accent",
      text: "text-palette-text",
      background: "text-palette-background",
    },
  },
  defaultVariants: {
    fontSize: "default",
    fontWeight: "default",
    color: "default",
  },
});

interface EmailsProps extends VariantProps<typeof emailsVariants> {
  list: YextEntityField<string[]>;
  includeHyperlink: boolean;
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
  fontSize: {
    label: "Font Size",
    type: "select",
    options: [
      { label: "Default", value: "default" },
      { label: "Extra Small", value: "xs" },
      { label: "Small", value: "sm" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "lg" },
      { label: "Extra Large", value: "xl" },
      { label: "2xl", value: "2xl" },
      { label: "3xl", value: "3xl" },
      { label: "4xl", value: "4xl" },
      { label: "5xl", value: "5xl" },
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

  return (
    <EntityField
      displayName="Email List"
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul
        className={themeMangerCn(
          "components",
          emailsVariants({ fontSize, fontWeight, color }),
          `${includeHyperlink ? "text-blue-600 dark:text-blue-500 hover:underline" : ""}`
        )}
      >
        {resolvedEmailList
          .slice(0, Math.min(resolvedEmailList.length, listLength))
          .map((text: any, index: any) => (
            <li key={index} className={`mb-2 flex items-center`}>
              <img className={"mr-2"} src={mailIcon} />
              <span>{includeHyperlink ? <a href={text}>{text}</a> : text}</span>
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
      field: "",
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
      fontWeight: {
        label: "Font Weight",
        type: "select",
        options: fontWeightOptions,
      },
    };
  },
  render: (props) => <Emails {...props} />,
};

export { EmailsComponent as Emails, type EmailsProps };
