import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { FaRegEnvelope } from "react-icons/fa";
import { useDocument } from "../../hooks/useDocument.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { CTA } from "../atoms/cta.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { Background } from "../atoms/background.tsx";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { updateFields } from "../pageSections/HeroSection.tsx";

export interface EmailsProps {
  data: {
    list: YextEntityField<string[]>;
  };

  styles?: {
    listLength?: number;
    showIcon?: boolean;
  };

  /** @internal Event name to be used for click analytics */
  eventName?: string;

  /** @internal */
  parentData?: {
    field: string;
    list: string[];
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
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      listLength: YextField(msg("fields.listLength", "List Length"), {
        type: "number",
        min: 1,
        max: 5,
        visible: false,
      }),
      showIcon: YextField(msg("fields.showIcon", "Show Icon"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
};

const EmailsComponent: PuckComponent<EmailsProps> = (props) => {
  const { data, styles, parentData, puck, eventName } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  const showEmailIcon = styles?.showIcon ?? true;

  let resolvedEmailList = parentData
    ? parentData.list
    : resolveComponentData(data.list, i18n.language, streamDocument);

  if (!!resolvedEmailList && !Array.isArray(resolvedEmailList)) {
    resolvedEmailList = [resolvedEmailList];
  }

  const filteredEmailList = resolvedEmailList?.length
    ? resolvedEmailList
        .slice(
          0,
          data.list.constantValueEnabled
            ? resolvedEmailList.length
            : Math.min(resolvedEmailList.length, styles?.listLength ?? 1)
        )
        .filter((e) => !!e)
    : [];

  return filteredEmailList?.length ? (
    <EntityField
      displayName={pt("fields.emailList", "Email List")}
      fieldId={parentData ? parentData.field : data.list.field}
      constantValueEnabled={data.list.constantValueEnabled}
    >
      <ul className="list-inside flex flex-col gap-4">
        {filteredEmailList.map((email, index) => (
          <li key={index} className={`flex items-center gap-3`}>
            {showEmailIcon && (
              <Background
                background={backgroundColors.background2.value}
                className={`h-10 w-10 flex justify-center rounded-full items-center`}
              >
                <FaRegEnvelope className="w-4 h-4" />
              </Background>
            )}
            <CTA
              eventName={`${eventName || "email"}${index}`}
              link={email}
              label={email}
              linkType="EMAIL"
              variant="link"
              alwaysHideCaret={true}
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
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(EmailsFields, data);

    if (data.props.data.list.constantValueEnabled) {
      return updatedFields;
    }

    return updateFields(updatedFields, ["styles.listLength.visible"], true);
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
      showIcon: true,
    },
  },
  render: (props) => <EmailsComponent {...props} />,
};
