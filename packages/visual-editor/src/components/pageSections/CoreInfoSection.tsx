import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Address,
  AddressType,
  AnalyticsScopeProvider,
  DayOfWeekNames,
  getDirections,
  HoursType,
} from "@yext/pages-components";
import { FaRegEnvelope } from "react-icons/fa";
import {
  YextEntityField,
  HeadingLevel,
  BackgroundStyle,
  useDocument,
  PageSection,
  EntityField,
  Heading,
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
  ThemeOptions,
  usePlatformTranslation,
  TranslatableStringField,
  getAnalyticsScopeHash,
  CTAProps,
  resolveComponentData,
} from "@yext/visual-editor";

export interface CoreInfoData {
  /** Content for the "Information" column. */
  info: {
    headingText: YextEntityField<TranslatableString>;
    address: YextEntityField<AddressType>;
    phoneNumbers: Array<{
      number: YextEntityField<string>;
      label: TranslatableString;
    }>;
    emails: YextEntityField<string[]>;
  };

  /** Content for the "Hours" column. */
  hours: {
    headingText: YextEntityField<TranslatableString>;
    hours: YextEntityField<HoursType>;
  };

  /** Content for the "Services" column. */
  services: {
    headingText: YextEntityField<TranslatableString>;
    servicesList: YextEntityField<TranslatableString[]>;
  };
}

export interface CoreInfoStyles {
  /**
   * The background color of the section.
   * @defaultValue `Background Color 1`
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for all column headings. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the "Information" column. */
  info: {
    showGetDirectionsLink: boolean;
    phoneFormat: "domestic" | "international";
    includePhoneHyperlink: boolean;
    emailsListLength?: number;
    ctaVariant: CTAProps["variant"];
  };

  /** Styling for the "Hours" column. */
  hours: {
    startOfWeek: keyof DayOfWeekNames | "today";
    collapseDays: boolean;
    showAdditionalHoursText: boolean;
  };
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
          headingText: YextField<any, TranslatableString>(
            msg("fields.headingText", "Heading Text"),
            {
              type: "entityField",
              filter: { types: ["type.string"] },
            }
          ),
          address: YextField<any, AddressType>(
            msg("fields.address", "Address"),
            {
              type: "entityField",
              filter: { types: ["type.address"] },
            }
          ),
          phoneNumbers: YextField(msg("fields.phoneNumbers", "Phone Numbers"), {
            type: "array",
            arrayFields: {
              number: YextField<any, string>(
                msg("fields.phoneNumber", "Phone Number"),
                {
                  type: "entityField",
                  filter: {
                    types: ["type.phone"],
                  },
                }
              ),
              label: TranslatableStringField(msg("fields.label", "Label"), {
                types: ["type.string"],
              }),
            },
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
          emails: YextField<any, string[]>(msg("fields.emails", "Emails"), {
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
      hours: YextField(msg("fields.hoursColumn", "Hours Column"), {
        type: "object",
        objectFields: {
          headingText: YextField<any, TranslatableString>(
            msg("fields.headingText", "Heading Text"),
            {
              type: "entityField",
              filter: {
                types: ["type.string"],
              },
            }
          ),
          hours: YextField(msg("fields.hours", "Hours"), {
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
          }),
        },
      }),
      services: YextField(msg("fields.servicesColumn", "Services Column"), {
        type: "object",
        objectFields: {
          headingText: YextField<any, TranslatableString>(
            msg("fields.headingText", "Heading Text"),
            {
              type: "entityField",
              filter: {
                types: ["type.string"],
              },
            }
          ),
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
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
          showGetDirectionsLink: YextField(
            msg("fields.showGetDirectionsLink", "Show Get Directions Link"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
          phoneFormat: YextField(msg("fields.phoneFormat", "Phone Format"), {
            type: "radio",
            options: "PHONE_OPTIONS",
          }),
          includePhoneHyperlink: YextField(
            msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
          ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
            type: "radio",
            options: "CTA_VARIANT",
          }),
        },
      }),
      hours: YextField(msg("fields.hoursColumn", "Hours Column"), {
        type: "object",
        objectFields: {
          startOfWeek: YextField(
            msg("fields.startOfTheWeek", "Start of the Week"),
            {
              type: "select",
              hasSearch: true,
              options: "HOURS_OPTIONS",
            }
          ),
          collapseDays: YextField(msg("fields.collapseDays", "Collapse Days"), {
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          }),
          showAdditionalHoursText: YextField(
            msg(
              "fields.options.showAdditionalHoursText",
              "Show additional hours text"
            ),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.yes", "Yes"), value: true },
                { label: msg("fields.options.no", "No"), value: false },
              ],
            }
          ),
        },
      }),
    },
  }),
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
const CoreInfoSectionWrapper = ({ data, styles }: CoreInfoSectionProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const addressHeadingText = resolveComponentData(
    data.info.headingText,
    locale,
    streamDocument
  );
  const resolvedAddress = resolveComponentData(
    data.info.address,
    locale,
    streamDocument
  );
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

  const hoursHeadingText = resolveComponentData(
    data.hours.headingText,
    locale,
    streamDocument
  );
  const resolvedHours = resolveComponentData(
    data.hours.hours,
    locale,
    streamDocument
  );
  const servicesHeadingText = resolveComponentData(
    data.services.headingText,
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
  const coordinates = getDirections(
    resolvedAddress as AddressType,
    undefined,
    undefined,
    { provider: "google" }
  );
  const { additionalHoursText } = streamDocument as {
    additionalHoursText: string;
  };

  const hasCoreInfo: boolean =
    !!addressHeadingText ||
    !!resolvedAddress?.line1 ||
    !!resolvedAddress?.city ||
    !!resolvedAddress?.postalCode ||
    !!resolvedAddress?.countryCode ||
    resolvedPhoneNumbers?.length > 0 ||
    resolvedEmails?.length > 0 ||
    !!(coordinates && styles?.info?.showGetDirectionsLink);

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      className={`flex flex-col md:flex-row justify-between w-full gap-8 ${
        (!resolvedHours && servicesList) || (resolvedHours && !servicesList)
          ? "md:[&>section]:w-1/2"
          : "md:[&>section]:w-1/3"
      }`}
      background={styles?.backgroundColor}
      aria-label={t("coreInfoSection", "Core Info Section")}
    >
      {hasCoreInfo && (
        <section
          aria-label={t("informationSection", "Information Section")}
          className="flex flex-col gap-4"
        >
          {addressHeadingText && (
            <EntityField
              displayName={pt("fields.headingText", "Heading Text")}
              fieldId={data.info.headingText.field}
              constantValueEnabled={data.info.headingText.constantValueEnabled}
            >
              <div className={`flex ${justifyClass}`}>
                <Heading level={styles?.heading?.level ?? 2}>
                  {addressHeadingText}
                </Heading>
              </div>
            </EntityField>
          )}
          <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
            {resolvedAddress && (
              <EntityField
                displayName={pt("fields.address", "Address")}
                fieldId={data.info.address.field}
                constantValueEnabled={data.info.address.constantValueEnabled}
              >
                <Address
                  address={resolvedAddress}
                  lines={[
                    ["line1"],
                    ["line2"],
                    ["city", ",", "region", "postalCode"],
                  ]}
                />
              </EntityField>
            )}
            {coordinates && styles.info.showGetDirectionsLink && (
              <CTA
                eventName={`getDirections`}
                className="font-bold"
                link={coordinates}
                label={t("getDirections", "Get Directions")}
                linkType="DRIVING_DIRECTIONS"
                target="_blank"
                variant={styles.info.ctaVariant}
              />
            )}
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
          {hoursHeadingText && (
            <EntityField
              displayName={pt("fields.headingText", "Heading Text")}
              fieldId={data.hours.headingText.field}
              constantValueEnabled={data.hours.headingText.constantValueEnabled}
            >
              <div className={`flex ${justifyClass}`}>
                <Heading level={styles.heading.level}>
                  {hoursHeadingText}
                </Heading>
              </div>
            </EntityField>
          )}
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
          {servicesHeadingText && (
            <EntityField
              displayName={pt("fields.headingText", "Heading Text")}
              fieldId={data.services.headingText.field}
              constantValueEnabled={
                data.services.headingText.constantValueEnabled
              }
            >
              <div className={`flex ${justifyClass}`}>
                <Heading level={styles.heading.level}>
                  {servicesHeadingText}
                </Heading>
              </div>
            </EntityField>
          )}
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
export const CoreInfoSection: ComponentConfig<CoreInfoSectionProps> = {
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
        headingText: {
          field: "",
          constantValue: {
            en: "Information",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        address: {
          field: "address",
          constantValue: {
            line1: "",
            city: "",
            postalCode: "",
            countryCode: "",
          },
        },
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
        headingText: {
          field: "",
          constantValue: {
            en: "Hours",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        hours: {
          field: "hours",
          constantValue: {},
        },
      },
      services: {
        headingText: {
          field: "",
          constantValue: {
            en: "Services",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        servicesList: {
          field: "services",
          constantValue: [],
        },
      },
    },
    styles: {
      heading: {
        level: 3,
        align: "left",
      },
      backgroundColor: backgroundColors.background1.value,
      info: {
        showGetDirectionsLink: true,
        phoneFormat: "domestic",
        includePhoneHyperlink: true,
        emailsListLength: 1,
        ctaVariant: "link",
      },
      hours: {
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: true,
      },
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
