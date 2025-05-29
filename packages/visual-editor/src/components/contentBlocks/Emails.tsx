import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  CTA,
  Body,
  YextField,
  i18n,
} from "@yext/visual-editor";

export interface EmailsProps {
  list: YextEntityField<string[]>;
  listLength: number;
  includeHyperlink: boolean;
}

const EmailsFields: Fields<EmailsProps> = {
  list: YextField<any, string[]>(i18n("Emails"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
      allowList: ["emails"],
      includeListsOnly: true,
    },
  }),
  includeHyperlink: YextField(i18n("Include Hyperlink"), {
    type: "radio",
    options: [
      { label: i18n("Yes"), value: true },
      { label: i18n("No"), value: false },
    ],
  }),
  listLength: YextField(i18n("List Length"), {
    type: "number",
    min: 1,
    max: 100,
  }),
};

const EmailsComponent: React.FC<EmailsProps> = ({
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
      displayName={i18n("Email List")}
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul className="components list-inside">
        {resolvedEmailList
          .slice(0, Math.min(resolvedEmailList.length, listLength))
          ?.map((email, index) => (
            <li key={index} className={`mb-2 flex items-center`}>
              <FaEnvelope className={"mr-2 my-auto"} />
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

export const Emails: ComponentConfig<EmailsProps> = {
  label: i18n("Emails"),
  fields: EmailsFields,
  defaultProps: {
    list: {
      field: "emails",
      constantValue: [],
    },
    includeHyperlink: true,
    listLength: 5,
  },
  render: (props) => <EmailsComponent {...props} />,
};
