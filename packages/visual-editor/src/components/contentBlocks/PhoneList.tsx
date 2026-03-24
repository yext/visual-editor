import { backgroundColors } from "../../utils/themeConfigOptions.ts";
import { EntityField } from "../../editor/EntityField.tsx";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { PhoneAtom } from "../atoms/phone.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { YextField } from "../../editor/YextField.tsx";
import {
  defaultPhoneDataProps,
  PhoneDataFields,
  PhoneStyleFields,
  PhoneProps,
} from "./Phone.tsx";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";

export interface PhoneListProps {
  data: {
    phoneNumbers: Array<PhoneProps["data"]>;
  };
  styles: PhoneProps["styles"];

  /** @internal Event name to be used for click analytics */
  eventName?: string;

  /** @internal */
  parentData?: {
    field: string;
    phoneNumbers: {
      label: string;
      number: string;
    }[];
  };
}

export const phoneListFields: Fields<PhoneListProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      phoneNumbers: YextField(msg("fields.phoneNumbers", "Phone Numbers"), {
        type: "array",
        arrayFields: PhoneDataFields,
        defaultItemProps: defaultPhoneDataProps,
        getItemSummary: (item) => {
          const locale = i18nComponentsInstance.language;
          const resolvedValue = resolveComponentData(item.label, locale);

          if (resolvedValue) {
            return resolvedValue;
          }
          return pt("phone", "Phone");
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      ...PhoneStyleFields,
    },
  }),
};

type ResolvedPhoneNumber = {
  number: string;
  label?: string;
};

export const resolvePhoneNumbers = (
  phoneNumbers: Array<PhoneProps["data"]>,
  locale: string,
  streamDocument: any
): ResolvedPhoneNumber[] => {
  return (
    phoneNumbers
      ?.map((item): ResolvedPhoneNumber | null => {
        const number = resolveComponentData(
          item.number,
          locale,
          streamDocument
        );
        const label = resolveComponentData(item.label, locale, streamDocument);

        if (!number) {
          return null;
        }

        return { number, label };
      })
      ?.filter((item): item is ResolvedPhoneNumber => item !== null) ?? []
  );
};

export const PhoneListComponent: PuckComponent<PhoneListProps> = (props) => {
  const { data, styles, parentData, puck } = props;
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedPhoneNumbers = parentData
    ? parentData.phoneNumbers
    : resolvePhoneNumbers(data.phoneNumbers, locale, streamDocument);

  return resolvedPhoneNumbers.length > 0 ? (
    <ul className="flex flex-col gap-4">
      {resolvedPhoneNumbers.map((phone, idx) => {
        return (
          <li
            key={`${phone.number}-${idx}`}
            className="flex gap-2 items-center"
          >
            <EntityField
              displayName={pt("fields.phoneNumber", "Phone Number")}
              fieldId={
                parentData
                  ? parentData.field
                  : data.phoneNumbers[idx]?.number?.field
              }
              constantValueEnabled={
                data.phoneNumbers[idx]?.number?.constantValueEnabled
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-2 items-center">
                  <PhoneAtom
                    eventName={`${props.eventName || "phone"}${idx}`}
                    backgroundColor={backgroundColors.background2.value}
                    label={phone.label}
                    phoneNumber={phone.number}
                    format={styles.phoneFormat}
                    includeHyperlink={styles.includePhoneHyperlink}
                    includeIcon={styles.includeIcon ?? true}
                  />
                </div>
              </div>
            </EntityField>
          </li>
        );
      })}
    </ul>
  ) : puck.isEditing ? (
    <div className="h-20" />
  ) : (
    <></>
  );
};

export const PhoneList: ComponentConfig<{ props: PhoneListProps }> = {
  label: msg("components.phoneList", "Phone List"),
  fields: phoneListFields,
  resolveFields: (data) => resolveDataFromParent(phoneListFields, data),
  defaultProps: {
    data: {
      phoneNumbers: [],
    },
    styles: {
      phoneFormat: "domestic",
      includePhoneHyperlink: true,
      includeIcon: true,
    },
  },
  render: (props) => <PhoneListComponent {...props} />,
};
