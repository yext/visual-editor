import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { FaRegEnvelope } from "react-icons/fa";
import {
  useDocument,
  EntityField,
  YextEntityField,
  CTA,
  YextField,
  resolveComponentData,
  msg,
  pt,
  Background,
  backgroundColors,
} from "@yext/visual-editor";

export interface EmailsProps {
  list: YextEntityField<string[]>;
  listLength?: number;
}

// Email fields used in Emails and CoreInfoSection
export const EmailsFields: Fields<EmailsProps> = {
  list: YextField<any, string[]>(msg("fields.emails", "Emails"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
      allowList: ["emails"],
    },
    disallowTranslation: true,
  }),
};

const EmailsComponent: React.FC<EmailsProps> = ({
  list: emailListField,
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
      displayName={pt("fields.emailList", "Email List")}
      fieldId={emailListField.field}
      constantValueEnabled={emailListField.constantValueEnabled}
    >
      <ul className="list-inside flex flex-col gap-4">
        {resolvedEmailList
          .slice(
            0,
            emailListField.constantValueEnabled
              ? resolvedEmailList.length
              : Math.min(resolvedEmailList.length, listLength!)
          )
          .map((email, index) => (
            <li key={index} className={`flex items-center gap-3`}>
              <Background
                background={backgroundColors.background2.value}
                className={`h-10 w-10 flex justify-center rounded-full items-center`}
              >
                <FaRegEnvelope className="w-4 h-4" />
              </Background>
              <CTA
                eventName={`email${index}`}
                link={email}
                label={email}
                linkType="EMAIL"
                variant="link"
              />
            </li>
          ))}
      </ul>
    </EntityField>
  );
};

export const Emails: ComponentConfig<{ props: EmailsProps }> = {
  label: msg("components.emails", "Emails"),
  fields: EmailsFields,
  resolveFields: (data, { fields }) => {
    if (data.props.list.constantValueEnabled) {
      return fields;
    }

    return {
      ...fields,
      listLength: YextField(msg("fields.listLength", "List Length"), {
        type: "number",
        isOptional: true,
        min: 1,
        max: 5,
      }),
    };
  },
  defaultProps: {
    list: {
      field: "emails",
      constantValue: [],
    },
    listLength: 3,
  },
  render: (props) => <EmailsComponent {...props} />,
};
