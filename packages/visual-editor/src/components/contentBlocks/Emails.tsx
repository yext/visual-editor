import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaEnvelope } from "react-icons/fa";
import {
  useDocument,
  EntityField,
  YextEntityField,
  CTA,
  Body,
  YextField,
  resolveComponentData,
  msg,
  pt,
} from "@yext/visual-editor";

export interface EmailsProps {
  list: YextEntityField<string[]>;
  listLength?: number;
  includeHyperlink: boolean;
}

const EmailsFields: Fields<EmailsProps> = {
  list: YextField<any, string[]>(msg("fields.emails", "Emails"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
      allowList: ["emails"],
      includeListsOnly: true,
    },
  }),
  includeHyperlink: YextField(
    msg("fields.includeHyperlink", "Include Hyperlink"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
};

const EmailsComponent: React.FC<EmailsProps> = ({
  list: emailListField,
  includeHyperlink,
  listLength,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  let resolvedEmailList = resolveComponentData(
    emailListField,
    i18n.language,
    streamDocument
  );
  if (!resolvedEmailList) {
    return;
  } else if (!Array.isArray(resolvedEmailList)) {
    resolvedEmailList = [resolvedEmailList];
  }

  return (
    <EntityField
      displayName={pt("emailList", "Email List")}
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul className="components list-inside">
        {resolvedEmailList
          .slice(
            0,
            emailListField.constantValueEnabled
              ? resolvedEmailList.length
              : Math.min(resolvedEmailList.length, listLength!)
          )
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
  label: "Emails",
  fields: EmailsFields,
  resolveFields: (data, { fields }) => {
    if (data.props.list.constantValueEnabled) {
      return fields;
    }

    return {
      ...fields,
      listLength: YextField(msg("fields.listLength", "List Length"), {
        type: "number",
        min: 1,
        max: 100,
      }),
    };
  },
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
