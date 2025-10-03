import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
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
  data: {
    list: YextEntityField<string[]>;
  };
  styles?: {
    listLength?: number;
  };
}

// Email fields used in Emails and CoreInfoSection
export const EmailsFields: Fields<EmailsProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      list: YextField<any, string[]>(msg("fields.emails", "Emails"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["emails"],
        },
        disallowTranslation: true,
      }),
    },
  }),
};

const EmailsComponent: PuckComponent<EmailsProps> = (props) => {
  const { data, styles, puck } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  let resolvedEmailList = resolveComponentData(
    data.list,
    i18n.language,
    streamDocument
  );

  if (!!resolvedEmailList && !Array.isArray(resolvedEmailList)) {
    resolvedEmailList = [resolvedEmailList];
  }

  return resolvedEmailList?.length ? (
    <EntityField
      displayName={pt("fields.emailList", "Email List")}
      fieldId={data.list.field}
      constantValueEnabled={data.list.constantValueEnabled}
    >
      <ul className="list-inside flex flex-col gap-4">
        {resolvedEmailList
          .slice(
            0,
            data.list.constantValueEnabled
              ? resolvedEmailList.length
              : Math.min(resolvedEmailList.length, styles?.listLength ?? 1)
          )
          .filter((e) => !!e)
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
  ) : puck.isEditing ? (
    <div className="h-10" />
  ) : (
    <></>
  );
};

export const Emails: ComponentConfig<EmailsProps> = {
  label: msg("components.emails", "Emails"),
  fields: EmailsFields,
  resolveFields: (data, { fields }) => {
    if (data.props.data.list.constantValueEnabled) {
      return fields;
    }

    return {
      ...fields,
      styles: YextField(msg("fields.styles", "Styles"), {
        type: "object",
        objectFields: {
          listLength: YextField(msg("fields.listLength", "List Length"), {
            type: "number",
            min: 1,
            max: 5,
          }),
        },
      }),
    };
  },
  defaultProps: {
    data: {
      list: {
        field: "emails",
        constantValue: [],
      },
    },
    styles: {
      listLength: 3,
    },
  },
  render: (props) => <EmailsComponent {...props} />,
};
