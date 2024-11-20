import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { cva, type VariantProps } from "class-variance-authority";
import mailIcon from "./assets/mail_outline.svg";
import {
  yextCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  getFontWeightOverrideOptions,
} from "../../index.js";
import {
  colorVariants,
  fontSizeVariants,
  fontWeightVariants,
} from "./variants.js";

const emailsVariants = cva("list-inside font-body-fontFamily", {
  variants: {
    fontSize: fontSizeVariants,
    fontWeight: fontWeightVariants,
    color: colorVariants,
  },
  defaultVariants: {
    fontSize: "default",
    fontWeight: "default",
    color: "default",
  },
});

export interface EmailsProps extends VariantProps<typeof emailsVariants> {
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
    <EntityField displayName="Email List" fieldId={emailListField.field}>
      <ul
        className={yextCn(
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

export const EmailsComponent: ComponentConfig<EmailsProps> = {
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

export { Emails, emailsVariants };
