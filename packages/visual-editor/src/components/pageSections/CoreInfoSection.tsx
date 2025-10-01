import * as React from "react";
import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import { AnalyticsScopeProvider, HoursType } from "@yext/pages-components";
import { FaRegEnvelope } from "react-icons/fa";
import {
  YextEntityField,
  BackgroundStyle,
  useDocument,
  PageSection,
  EntityField,
  CTA,
  backgroundColors,
  Body,
  PhoneAtom,
  Background,
  YextField,
  VisibilityWrapper,
  TranslatableString,
  HoursTableAtom,
  msg,
  pt,
  usePlatformTranslation,
  getAnalyticsScopeHash,
  resolveComponentData,
} from "@yext/visual-editor";
import {
  defaultPhoneDataProps,
  PhoneDataFields,
  PhoneProps,
  PhoneStyleFields,
} from "../contentBlocks/Phone.tsx";
import { EmailsFields } from "../contentBlocks/Emails.tsx";
import {
  HoursTableDataField,
  HoursTableProps,
  HoursTableStyleFields,
} from "../contentBlocks/HoursTable.tsx";

export interface CoreInfoData {
  /** Content for the "Information" column. */
  info: {
    /** The phone number for the entity */
    phoneNumbers: Array<PhoneProps["data"]>;
    /** Emails associated with the entity */
    emails: YextEntityField<string[]>;
  };

  /** Content for the "Hours" column. */
  hours: {
    /** The hours for the entity */
    hours: YextEntityField<HoursType>;
  };

  /** Content for the "Services" column. */
  services: {
    /** A text list, often of services the entity provides */
    servicesList: YextEntityField<TranslatableString[]>;
  };
}

export interface CoreInfoStyles {
  /**
   * The background color of the section.
   * @defaultValue `Background Color 1`
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the "Information" column. */
  info: PhoneProps["styles"] & {
    emailsListLength?: number;
  };

  /** Styling for the "Hours" column. */
  hours: Omit<HoursTableProps["styles"], "alignment">;
}

export interface CoreInfoSectionProps {
  /**
   * This object contains all the content to be displayed within the three columns.
   * @propCategory Data Props
   */
  data: CoreInfoData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: CoreInfoStyles;

  slots: {
    InfoHeadingSlot: Slot;
    InfoAddressSlot: Slot;
    HoursHeadingSlot: Slot;
    ServicesHeadingSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const coreInfoSectionFields: Fields<CoreInfoSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      info: YextField(msg("fields.infoColumn", "Info Column"), {
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
          emails: EmailsFields.list,
        },
      }),
      hours: YextField(msg("fields.hoursColumn", "Hours Column"), {
        type: "object",
        objectFields: {
          hours: HoursTableDataField,
        },
      }),
      services: YextField(msg("fields.servicesColumn", "Services Column"), {
        type: "object",
        objectFields: {
          servicesList: YextField<any, TranslatableString[]>(
            msg("fields.servicesList", "Services List"),
            {
              type: "entityField",
              filter: {
                types: ["type.string"],
                includeListsOnly: true,
                allowList: ["services"],
              },
            }
          ),
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      info: YextField(msg("fields.infoColumn", "Info Column"), {
        type: "object",
        objectFields: {
          ...PhoneStyleFields,
        },
      }),
      hours: YextField(msg("fields.hoursColumn", "Hours Column"), {
        type: "object",
        objectFields: HoursTableStyleFields,
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      InfoHeadingSlot: { type: "slot" },
      InfoAddressSlot: { type: "slot" },
      HoursHeadingSlot: { type: "slot" },
      ServicesHeadingSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

/**
 * The Core Info Section is a comprehensive component designed to display essential business information in a clear, multi-column layout. It typically includes contact details (address, phone, email), hours of operation, and a list of services, with extensive options for customization.
 * Available on Location templates.
 */
const CoreInfoSectionWrapper: PuckComponent<CoreInfoSectionProps> = (props) => {
  const { data, styles, slots } = props;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const AddressElement = slots.InfoAddressSlot;

  const resolvedEmails = resolveComponentData(
    data.info.emails,
    locale,
    streamDocument
  );

  type ResolvedPhoneNumber = {
    number: string;
    label?: string;
  };
  const resolvedPhoneNumbers: ResolvedPhoneNumber[] =
    data?.info?.phoneNumbers
      ?.map((item): ResolvedPhoneNumber | null => {
        const number = resolveComponentData(
          item.number,
          locale,
          streamDocument
        );
        const label = resolveComponentData(
          item.label,
          i18n.language,
          streamDocument
        );

        if (!number) return null;

        return { number, label };
      })
      ?.filter((item): item is ResolvedPhoneNumber => item !== null) ?? [];

  const resolvedHours = resolveComponentData(
    data.hours.hours,
    locale,
    streamDocument
  );

  const servicesList = resolveComponentData(
    data.services.servicesList,
    locale,
    streamDocument
  )?.map((translatableString: TranslatableString) =>
    resolveComponentData(translatableString, i18n.language)
  );
  const { additionalHoursText } = streamDocument as {
    additionalHoursText: string;
  };

  const hasCoreInfo: boolean =
    React.isValidElement(AddressElement) ||
    (resolvedPhoneNumbers?.length ?? 0) > 0 ||
    (resolvedEmails?.length ?? 0) > 0;

  const sectionCount = [hasCoreInfo, resolvedHours, servicesList].filter(
    Boolean
  ).length;

  const gridColsClass = [
    "grid-cols-1",
    `md:grid-cols-${Math.min(sectionCount, 2)}`,
    `lg:grid-cols-${Math.min(sectionCount, 3)}`,
  ].join(" ");

  return (
    <PageSection
      className={`grid w-full gap-8 ${gridColsClass}`}
      background={styles?.backgroundColor}
      aria-label={t("coreInfoSection", "Core Info Section")}
    >
      {hasCoreInfo && (
        <section
          aria-label={t("informationSection", "Information Section")}
          className="flex flex-col gap-4"
        >
          <slots.InfoHeadingSlot />
          <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
            <slots.InfoAddressSlot />
          </div>
          {resolvedPhoneNumbers.length > 0 && (
            <ul className="flex flex-col gap-4">
              {resolvedPhoneNumbers.map((phone, idx) => {
                return (
                  <li
                    key={`${phone.number}-${idx}`}
                    className="flex gap-2 items-center"
                  >
                    {/* Assuming you want to associate this with the original EntityField data —
              fallback to data.info.phoneNumbers[idx] */}
                    <EntityField
                      displayName={pt("fields.phoneNumber", "Phone Number")}
                      fieldId={data.info.phoneNumbers[idx]?.number?.field}
                      constantValueEnabled={
                        data.info.phoneNumbers[idx]?.number
                          ?.constantValueEnabled
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2 items-center">
                          <PhoneAtom
                            eventName={`phone${idx}`}
                            backgroundColor={backgroundColors.background2.value}
                            label={phone.label}
                            phoneNumber={phone.number}
                            format={styles.info.phoneFormat}
                            includeHyperlink={styles.info.includePhoneHyperlink}
                            includeIcon={true}
                          />
                        </div>
                      </div>
                    </EntityField>
                  </li>
                );
              })}
            </ul>
          )}
          {resolvedEmails && (
            <EntityField
              displayName={pt("fields.emailList", "Email List")}
              fieldId={data.info.emails.field}
              constantValueEnabled={data.info.emails.constantValueEnabled}
            >
              <ul className="list-inside flex flex-col gap-4">
                {resolvedEmails
                  .slice(
                    0,
                    data.info.emails.constantValueEnabled
                      ? resolvedEmails.length
                      : Math.min(
                          resolvedEmails.length,
                          styles.info.emailsListLength!
                        )
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
          )}
        </section>
      )}
      {resolvedHours && (
        <section
          aria-label={t("hoursSection", "Hours Section")}
          className="flex flex-col gap-4"
        >
          <slots.HoursHeadingSlot />
          <EntityField
            displayName={pt("fields.hours", "Hours")}
            fieldId="hours"
            constantValueEnabled={data.hours.hours.constantValueEnabled}
          >
            <HoursTableAtom
              hours={resolvedHours}
              startOfWeek={styles.hours.startOfWeek}
              collapseDays={styles.hours.collapseDays}
            />
          </EntityField>
          {additionalHoursText && styles.hours.showAdditionalHoursText && (
            <EntityField
              displayName={pt("fields.hoursText", "Hours Text")}
              fieldId="additionalHoursText"
            >
              <Body className="mt-4 text-body-sm-fontSize">
                {additionalHoursText}
              </Body>
            </EntityField>
          )}
        </section>
      )}
      {servicesList && servicesList.length > 0 && (
        <section
          aria-label={t("servicesSection", "Services Section")}
          className="flex flex-col gap-4"
        >
          <slots.ServicesHeadingSlot />
          <EntityField
            displayName={pt("fields.textList", "Text List")}
            fieldId={data.services.servicesList.field}
            constantValueEnabled={
              data.services.servicesList.constantValueEnabled
            }
          >
            <ul className="list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
              {servicesList.map((text: any, index: any) => (
                <li key={index} className="mb-2">
                  {text}
                </li>
              ))}
            </ul>
          </EntityField>
        </section>
      )}
    </PageSection>
  );
};

/**
 * The Core Info Section is a comprehensive component designed to display essential business information in a clear, multi-column layout. It typically includes contact details (address, phone, email), hours of operation, and a list of services, with extensive options for customization.
 * Available on Location templates.
 */
export const CoreInfoSection: ComponentConfig<{ props: CoreInfoSectionProps }> =
  {
    label: msg("components.coreInfoSection", "Core Info Section"),
    fields: coreInfoSectionFields,
    resolveFields: (data, { fields }) => {
      if (data.props.data.info.emails.constantValueEnabled) {
        return fields;
      }

      return {
        ...fields,
        styles: {
          ...fields.styles,
          objectFields: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.styles.objectFields,
            info: {
              // @ts-expect-error ts(2339) objectFields exists
              ...fields.styles.objectFields.info,
              objectFields: {
                // @ts-expect-error ts(2339) objectFields exists
                ...fields.styles.objectFields.info.objectFields,
                emailsListLength: YextField(
                  msg("fields.emailsListLength", "Emails List Length"),
                  {
                    type: "number",
                    min: 0,
                    max: 3,
                  }
                ),
              },
            },
          },
        },
      };
    },
    defaultProps: {
      data: {
        info: {
          phoneNumbers: [
            {
              number: {
                field: "mainPhone",
                constantValue: "",
              },
              label: {
                en: "Phone",
                hasLocalizedValue: "true",
              },
            },
          ],
          emails: {
            field: "emails",
            constantValue: [],
          },
        },
        hours: {
          hours: {
            field: "hours",
            constantValue: {},
          },
        },
        services: {
          servicesList: {
            field: "services",
            constantValue: [],
          },
        },
      },
      styles: {
        backgroundColor: backgroundColors.background1.value,
        info: {
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          emailsListLength: 1,
        },
        hours: {
          startOfWeek: "today",
          collapseDays: false,
          showAdditionalHoursText: true,
        },
      },
      slots: {
        InfoHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Information",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        InfoAddressSlot: [
          {
            type: "AddressSlot",
            props: {
              data: {
                address: {
                  constantValue: {
                    line1: "",
                    city: "",
                    postalCode: "",
                    countryCode: "",
                  },
                  field: "address",
                },
              },
              styles: {
                showGetDirectionsLink: true,
                ctaVariant: "link",
              },
            },
          },
        ],
        HoursHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Hours",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        ServicesHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Services",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
      },
      analytics: {
        scope: "coreInfoSection",
      },
      liveVisibility: true,
    },
    render: (props) => (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "coreInfoSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <CoreInfoSectionWrapper {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    ),
  };
