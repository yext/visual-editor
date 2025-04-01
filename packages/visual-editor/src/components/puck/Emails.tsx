import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import mailIcon from "./assets/mail_outline.svg";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  CTA,
  Body,
} from "../../index.js";

interface EmailsProps {
  list: YextEntityField<string[]>;
  listLength: number;
  includeHyperlink: boolean;
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
  let resolvedEmailList = resolveYextEntityField(document, emailListField);
  if (!resolvedEmailList) {
    return;
  } else if (!Array.isArray(resolvedEmailList)) {
    resolvedEmailList = [resolvedEmailList];
  }

  return (
    <EntityField
      displayName="Email List"
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul className="components list-inside">
        {resolvedEmailList
          .slice(0, Math.min(resolvedEmailList.length, listLength))
          .map((email, index) => (
            <li key={index} className={`mb-2 flex items-center`}>
              <img className={"mr-2 my-auto"} src={mailIcon} />
              {includeHyperlink && !!email ? (
                <CTA
                  link={email}
                  label={email}
                  linkType="EMAIL"
                  variant="link"
                />
              ) : (
                <Body>{email}</Body>
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
