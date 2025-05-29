import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Address,
  AddressType,
  DayOfWeekNames,
  getDirections,
  HoursTable,
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
  i18n,
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
      emailsListLength: number;
    };
    hours: {
      startOfWeek: keyof DayOfWeekNames | "today";
      collapseDays: boolean;
      showAdditionalHoursText: boolean;
    };
  };
  liveVisibility: boolean;
}

const coreInfoSectionFields: Fields<CoreInfoSectionProps> = {
  data: YextField(i18n("Data"), {
    type: "object",
    objectFields: {
      info: YextField(i18n("Info Column"), {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>(i18n("Heading Text"), {
            type: "entityField",
            filter: { types: ["type.string"] },
          }),
          address: YextField<any, AddressType>(i18n("Address"), {
            type: "entityField",
            filter: { types: ["type.address"] },
          }),
          phoneNumbers: YextField(i18n("Phone Numbers"), {
            type: "array",
            arrayFields: {
              number: YextField<any, string>(i18n("Phone Number"), {
                type: "entityField",
                filter: {
                  types: ["type.phone"],
                },
              }),
              label: YextField(i18n("Label"), {
                type: "text",
              }),
            },
            getItemSummary: (item) => item.label || "Item",
          }),
          emails: YextField<any, string[]>(i18n("Emails"), {
            type: "entityField",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
              allowList: ["emails"],
            },
          }),
        },
      }),
      hours: YextField(i18n("Hours Column"), {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>(i18n("Heading Text"), {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          hours: YextField(i18n("Hours"), {
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
          }),
        },
      }),
      services: YextField(i18n("Services Column"), {
        type: "object",
        objectFields: {
          headingText: YextField<any, string>(i18n("Heading Text"), {
            type: "entityField",
            filter: {
              types: ["type.string"],
            },
          }),
          servicesList: YextField<any, string[]>(i18n("Services List"), {
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
  styles: YextField(i18n("Styles"), {
    type: "object",
    objectFields: {
      headingLevel: YextField(i18n("Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      backgroundColor: YextField(i18n("Background Color"), {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      info: YextField(i18n("Info Column"), {
        type: "object",
        objectFields: {
          showGetDirectionsLink: YextField(i18n("Show Get Directions Link"), {
            type: "radio",
            options: [
              { label: i18n("Yes"), value: true },
              { label: i18n("No"), value: false },
            ],
          }),
          phoneFormat: YextField(i18n("Phone Format"), {
            type: "radio",
            options: "PHONE_OPTIONS",
          }),
          includePhoneHyperlink: YextField(i18n("Include Phone Hyperlink"), {
            type: "radio",
            options: [
              { label: i18n("Yes"), value: true },
              { label: i18n("No"), value: false },
            ],
          }),
          emailsListLength: YextField(i18n("List Length"), {
            type: "number",
            min: 0,
            max: 3,
          }),
        },
      }),
      hours: YextField(i18n("Hours Column"), {
        type: "object",
        objectFields: {
          startOfWeek: YextField(i18n("Start of the Week"), {
            type: "select",
            hasSearch: true,
            options: "HOURS_OPTIONS",
          }),
          collapseDays: YextField(i18n("Collapse Days"), {
            type: "radio",
            options: [
              { label: i18n("Yes"), value: true },
              { label: i18n("No"), value: false },
            ],
          }),
          showAdditionalHoursText: YextField(
            i18n("Show additional hours text"),
            {
              type: "radio",
              options: [
                { label: i18n("Yes"), value: true },
                { label: i18n("No"), value: false },
              ],
            }
          ),
        },
      }),
    },
  }),
  liveVisibility: YextField(i18n("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: i18n("Show"), value: true },
      { label: i18n("Hide"), value: false },
    ],
  }),
};

const CoreInfoSectionWrapper = ({ data, styles }: CoreInfoSectionProps) => {
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
      aria-label="Core Info Section"
    >
      <section aria-label="Information Section" className="flex flex-col gap-4">
        {addressHeadingText && (
          <EntityField
            displayName={i18n("Heading Text")}
            fieldId={data.info.headingText.field}
            constantValueEnabled={data.info.headingText.constantValueEnabled}
          >
            <Heading level={styles.headingLevel}>{addressHeadingText}</Heading>
          </EntityField>
        )}
        <div className="flex flex-col gap-2 text-body-fontSize font-body-fontWeight font-body-fontFamily">
          {resolvedAddress && (
            <EntityField
              displayName={i18n("Address")}
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
            {data.info.phoneNumbers.map((item) => {
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
                    displayName={i18n("Phone Number")}
                    fieldId={item.number.field}
                    constantValueEnabled={item.number.constantValueEnabled}
                  >
                    <div className={"flex items-center gap-3"}>
                      <div className="flex gap-2 items-center">
                        <PhoneAtom
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
            displayName={i18n("Email List")}
            fieldId={data.info.emails.field}
            constantValueEnabled={data.info.emails.constantValueEnabled}
          >
            <ul className="list-inside flex flex-col gap-4">
              {resolvedEmails
                .slice(
                  0,
                  Math.min(resolvedEmails.length, styles.info.emailsListLength)
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
        <section aria-label="Hours Section" className="flex flex-col gap-4">
          {hoursHeadingText && (
            <EntityField
              displayName={i18n("Heading Text")}
              fieldId={data.hours.headingText.field}
              constantValueEnabled={data.hours.headingText.constantValueEnabled}
            >
              <Heading level={styles.headingLevel}>{hoursHeadingText}</Heading>
            </EntityField>
          )}
          <EntityField
            displayName={i18n("Hours")}
            fieldId="hours"
            constantValueEnabled={data.hours.hours.constantValueEnabled}
          >
            <HoursTable
              hours={resolvedHours}
              startOfWeek={styles.hours.startOfWeek}
              collapseDays={styles.hours.collapseDays}
              className="text-body-fontSize font-body-fontWeight font-body-fontFamily"
            />
          </EntityField>
          {additionalHoursText && styles.hours.showAdditionalHoursText && (
            <EntityField
              displayName={i18n("Hours Text")}
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
        <section aria-label="Services Section" className="flex flex-col gap-4">
          {servicesHeadingText && (
            <EntityField
              displayName={i18n("Heading Text")}
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
            displayName={i18n("Text List")}
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
  label: i18n("Core Info Section"),
  fields: coreInfoSectionFields,
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
            label: i18n("Phone"),
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
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <CoreInfoSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
