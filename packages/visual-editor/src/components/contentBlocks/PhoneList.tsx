import {
  backgroundColors,
  EntityField,
  msg,
  PhoneAtom,
  pt,
  resolveComponentData,
  useDocument,
  usePlatformTranslation,
  YextField,
} from "@yext/visual-editor";
import {
  defaultPhoneDataProps,
  PhoneDataFields,
  PhoneStyleFields,
  PhoneProps,
} from "./Phone";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import { useTranslation } from "react-i18next";

export interface PhoneListProps {
  data: {
    phoneNumbers: Array<PhoneProps["data"]>;
  };
  styles: PhoneProps["styles"];

  /** @internal Event name to be used for click analytics */
  eventName?: string;
}

export const phoneListFields: Fields<PhoneListProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      phoneNumbers: YextField(msg("fields.phoneNumbers", "Phone Numbers"), {
        type: "array",
        arrayFields: PhoneDataFields,
        defaultItemProps: defaultPhoneDataProps,
        getItemSummary: (item): string => {
          const { i18n } = usePlatformTranslation();
          const streamDocument = useDocument();
          const resolvedValue = resolveComponentData(
            item.label,
            i18n.language,
            streamDocument
          );
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
  const { data, styles, puck } = props;
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedPhoneNumbers = resolvePhoneNumbers(
    data.phoneNumbers,
    locale,
    streamDocument
  );

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
              fieldId={data.phoneNumbers[idx]?.number?.field}
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
                    includeIcon={true}
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
  defaultProps: {
    data: {
      phoneNumbers: [],
    },
    styles: {
      phoneFormat: "domestic",
      includePhoneHyperlink: true,
    },
  },
  render: (props) => <PhoneListComponent {...props} />,
};
