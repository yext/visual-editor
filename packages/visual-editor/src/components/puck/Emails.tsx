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
} from "../../index.js";
import { Link } from "@yext/pages-components";

const emailsVariants = cva("components list-inside font-body-fontFamily", {
  variants: {
    includeHyperlink: {
      true: "underline hover:no-underline text-link-fontSize text-link-color",
      false: "text-body-fontSize text-body-color",
    },
  },
  defaultVariants: {
    includeHyperlink: true,
  },
});

interface EmailsProps extends VariantProps<typeof emailsVariants> {
  list: YextEntityField<string[]>;
  listLength: number;
}

const EmailsFields: Fields<EmailsProps> = {
  list: YextEntityFieldSelector({
    label: "Emails",
    filter: {
      types: ["type.string"],
      allowList: ["emails"],
      includeListsOnly: true,
    },
  }),
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

  const classNameCn = themeManagerCn(emailsVariants({ includeHyperlink }));

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
              {includeHyperlink && !!text ? (
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
  render: (props) => <Emails {...props} />,
};

export { EmailsComponent as Emails, type EmailsProps };
