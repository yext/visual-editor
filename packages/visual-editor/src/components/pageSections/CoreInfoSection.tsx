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
  resolveYextEntityField,
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
  HoursTableAtom,
} from "@yext/visual-editor";

export interface CoreInfoSectionProps {
  data: {
    info: {
      headingText: YextEntityField<string>;
      address: YextEntityField<AddressType>;
      phoneNumbers: Array<{ number: YextEntityField<string>; label: string }>;
      emails: YextEntityField<string[]>;
    };
    hours: {
      headingText: YextEntityField<string>;
      hours: YextEntityField<HoursType>;
    };
    services: {
      headingText: YextEntityField<string>;
      servicesList: YextEntityField<string[]>;
    };
  };
  styles: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    info: {
      showGetDirectionsLink: boolean;
      phoneFormat: "domestic" | "international";
      includePhoneHyperlink: boolean;
      emailsListLength?: number;
    };
    hours: {
      startOfWeek: keyof DayOfWeekNames | "today";
      collapseDays: boolean;
      showAdditionalHoursText: boolean;
    };
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
}

const coreInfoSectionFields: Fields<CoreInfoSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      info: YextField("Info Column", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: { types: ["type.string"] },
          }),
          address: YextField<any, AddressType>("Address", {
            type: "entityField",
            filter: { types: ["type.address"] },
          }),
          phoneNumbers: YextField("Phone Numbers", {
            type: "array",
            arrayFields: {
              number: YextField<any, string>("Phone Number", {
                type: "entityField",
                filter: {
                  types: ["type.phone"],
                },
              }),
              label: YextField("Label", {
                type: "text",
              }),
            },
            getItemSummary: (item) => item.label || "Phone",
          }),
          emails: YextField<any, string[]>("Emails", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
              allowList: ["emails"],
            },
          }),
        },
      }),
      hours: YextField("Hours Column", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          hours: YextField("Hours", {
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
          }),
        },
      }),
      services: YextField("Services Column", {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>("Heading Text", {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          servicesList: YextField<any, string[]>("Services List", {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
              allowList: ["services"],
            },
          }),
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      info: YextField("Info Column", {
        type: "object",
        objectFields: {
          showGetDirectionsLink: YextField("Show Get Directions Link", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
          phoneFormat: YextField("Phone Format", {
            type: "radio",
            options: "PHONE_OPTIONS",
          }),
          includePhoneHyperlink: YextField("Include Phone Hyperlink", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
        },
      }),
      hours: YextField("Hours Column", {
        type: "object",
        objectFields: {
          startOfWeek: YextField("Start of the Week", {
            type: "select",
            hasSearch: true,
            options: "HOURS_OPTIONS",
          }),
          collapseDays: YextField("Collapse Days", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
          showAdditionalHoursText: YextField("Show additional hours text", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
        },
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const CoreInfoSectionWrapper = ({ data, styles }: CoreInfoSectionProps) => {
  const { t } = useTranslation();
  const document = useDocument();
  const addressHeadingText = resolveYextEntityField<string>(
    document,
    data.info.headingText
  );
  const resolvedAddress = resolveYextEntityField<AddressType>(
    document,
    data.info.address
  );
  const resolvedEmails = resolveYextEntityField<string[]>(
    document,
    data.info.emails
  );
  const hoursHeadingText = resolveYextEntityField<string>(
    document,
    data.hours.headingText
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    data.hours.hours
  );
  const servicesHeadingText = resolveYextEntityField<string>(
    document,
    data.services.headingText
  );
  const servicesList = resolveYextEntityField<string[]>(
    document,
    data.services.servicesList
  );
  const coordinates = getDirections(
    resolvedAddress as AddressType,
    undefined,
    undefined,
    { provider: "google" }
  );
  const { additionalHoursText } = document as {
    additionalHoursText: string;
  };

  return (
    <PageSection
      className={`flex flex-col md:flex-row justify-between w-full gap-8 ${
        (!resolvedHours && servicesList) || (resolvedHours && !servicesList)
          ? "md:[&>section]:w-1/2"
          : "md:[&>section]:w-1/3"
      }`}
      background={styles.backgroundColor}
      aria-label={t("coreInfoSection", "Core Info Section")}
    >
      <section
        aria-label={t("informationSection", "Information Section")}
        className="flex flex-col gap-4"
      >
        {addressHeadingText && (
          <EntityField
            displayName={t("headingText", "Heading Text")}
            fieldId={data.info.headingText.field}
            constantValueEnabled={data.info.headingText.constantValueEnabled}
          >
            <Heading level={styles.headingLevel}>{addressHeadingText}</Heading>
          </EntityField>
        )}
        <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
          {resolvedAddress && (
            <EntityField
              displayName={t("address", "Address")}
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
              label="Get Directions"
              linkType="DRIVING_DIRECTIONS"
              target="_blank"
              variant="link"
            />
          )}
        </div>
        {data.info.phoneNumbers && (
          <ul className="flex flex-col gap-4">
            {data.info.phoneNumbers.map((item, idx) => {
              const resolvedNumber = resolveYextEntityField<string>(
                document,
                item.number
              );
              if (!resolvedNumber) {
                return;
              }

              return (
                <li key={item.label} className="flex gap-2 items-center">
                  <EntityField
                    displayName={t("phoneNumber", "Phone Number")}
                    fieldId={item.number.field}
                    constantValueEnabled={item.number.constantValueEnabled}
                  >
                    <div className={"flex items-center gap-3"}>
                      <div className="flex gap-2 items-center">
                        <PhoneAtom
                          eventName={`phone${idx}`}
                          backgroundColor={backgroundColors.background2.value}
                          label={item.label}
                          phoneNumber={resolvedNumber}
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
            displayName={t("emailList", "Email List")}
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
      {resolvedHours && (
        <section
          aria-label={t("hoursSection", "Hours Section")}
          className="flex flex-col gap-4"
        >
          {hoursHeadingText && (
            <EntityField
              displayName={t("headingText", "Heading Text")}
              fieldId={data.hours.headingText.field}
              constantValueEnabled={data.hours.headingText.constantValueEnabled}
            >
              <Heading level={styles.headingLevel}>{hoursHeadingText}</Heading>
            </EntityField>
          )}
          <EntityField
            displayName={t("hours", "Hours")}
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
              displayName={t("hoursText", "Hours Text")}
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
              displayName={t("headingText", "Heading Text")}
              fieldId={data.services.headingText.field}
              constantValueEnabled={
                data.services.headingText.constantValueEnabled
              }
            >
              <Heading level={styles.headingLevel}>
                {servicesHeadingText}
              </Heading>
            </EntityField>
          )}
          <EntityField
            displayName={t("textList", "Text List")}
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

export const CoreInfoSection: ComponentConfig<CoreInfoSectionProps> = {
  label: "Core Info Section",
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
              emailsListLength: YextField("Emails List Length", {
                type: "number",
                min: 0,
                max: 3,
              }),
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
          constantValue: "Information",
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
            label: "Phone",
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
          constantValue: "Hours",
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
          constantValue: "Services",
          constantValueEnabled: true,
        },
        servicesList: {
          field: "services",
          constantValue: [],
        },
      },
    },
    styles: {
      headingLevel: 3,
      backgroundColor: backgroundColors.background1.value,
      info: {
        showGetDirectionsLink: true,
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
    analytics: {
      scope: "coreInfoSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? ""}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <CoreInfoSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
