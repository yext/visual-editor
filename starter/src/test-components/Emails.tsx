import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";

export interface EmailsProps {
  emails: YextEntityField<TranslatableString[]>;
  label: YextEntityField<TranslatableString>;
}

const emailsFields: Fields<EmailsProps> = {
  emails: YextField<any, TranslatableString[]>("Emails", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  label: YextField<any, TranslatableString>("Label", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
};

const EmailsComponent = ({ emails, label }: EmailsProps) => {
  const { t, i18n } = useTranslation();
  const document = useDocument();
  const emailList = resolveYextEntityField(document, emails);
  const labelText = resolveTranslatableString(
    resolveYextEntityField(document, label),
    i18n.language,
  );

  return (
    <EntityField
      displayName={t("emails", "Emails")}
      fieldId={emails.field}
      constantValueEnabled={emails.constantValueEnabled}
    >
      <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
        {labelText && <span className="font-semibold">{labelText}: </span>}
        {emailList?.map((email, index) => (
          <React.Fragment key={index}>
            <a
              href={`mailto:${resolveTranslatableString(email, i18n.language)}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {resolveTranslatableString(email, i18n.language)}
            </a>
            {index < emailList.length - 1 && ", "}
          </React.Fragment>
        ))}
      </div>
    </EntityField>
  );
};

export const Emails: ComponentConfig<EmailsProps> = {
  label: "Emails",
  fields: emailsFields,
  defaultProps: {
    emails: {
      field: "",
      constantValue: ["example@email.com"],
      constantValueEnabled: true,
    },
    label: {
      field: "",
      constantValue: "Email",
      constantValueEnabled: true,
    },
  },
  render: (props) => <EmailsComponent {...props} />,
};
