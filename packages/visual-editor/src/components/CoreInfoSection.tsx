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
} from "@yext/visual-editor";

export interface CoreInfoSectionProps {
  styles: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
  address: {
    headingText: YextEntityField<string>;
    address: YextEntityField<AddressType>;
    showGetDirectionsLink: boolean;
  };
  phoneNumbers: {
    phoneNumber: Array<{ number: YextEntityField<string>; label: string }>;
    phoneFormat: "domestic" | "international";
    includePhoneHyperlink: boolean;
  };
  emails: {
    emails: YextEntityField<string[]>;
    listLength: number;
  };
  hours: {
    headingText: YextEntityField<string>;
    hours: YextEntityField<HoursType>;
    startOfWeek: keyof DayOfWeekNames | "today";
    collapseDays: boolean;
    showAdditionalHoursText: boolean;
  };
  services: {
    headingText: YextEntityField<string>;
    servicesList: YextEntityField<string[]>;
  };
}

const coreInfoSectionFields: Fields<CoreInfoSectionProps> = {
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
    },
  }),
  address: YextField("Info Column - Address", {
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
      showGetDirectionsLink: YextField("Show Get Directions Link", {
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      }),
    },
  }),
  phoneNumbers: YextField("Info Column - Phone", {
    type: "object",
    objectFields: {
      phoneNumber: YextField("Phone Numbers", {
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
        getItemSummary: (item) => item.label || "Item",
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
  emails: YextField("Info Column - Emails", {
    type: "object",
    objectFields: {
      emails: YextField<any, string[]>("Emails", {
        type: "entityField",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["emails"],
        },
      }),
      listLength: YextField("List Length", { type: "number", min: 0, max: 3 }),
    },
  }),
  hours: YextField("Info Column - Hours", {
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
  services: YextField("Info Column - Services", {
    type: "object",
    objectFields: {
      headingText: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      servicesList: YextField<any, string[]>("Text List", {
        type: "entityField",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["services"],
        },
      }),
    },
  }),
};

const CoreInfoSectionWrapper = ({
  styles,
  address: addressField,
  phoneNumbers: phoneNumbersField,
  emails: emailsField,
  hours: hoursField,
  services: servicesField,
}: CoreInfoSectionProps) => {
  const document = useDocument();
  const addressHeadingText = resolveYextEntityField<string>(
    document,
    addressField.headingText
  );
  const resolvedAddress = resolveYextEntityField<AddressType>(
    document,
    addressField.address
  );
  const resolvedEmails = resolveYextEntityField<string[]>(
    document,
    emailsField.emails
  );
  const hoursHeadingText = resolveYextEntityField<string>(
    document,
    hoursField.headingText
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    hoursField.hours
  );
  const servicesHeadingText = resolveYextEntityField<string>(
    document,
    servicesField.headingText
  );
  const servicesList = resolveYextEntityField<string[]>(
    document,
    servicesField.servicesList
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
            displayName="Heading Text"
            fieldId={addressField.headingText.field}
            constantValueEnabled={addressField.headingText.constantValueEnabled}
          >
            <Heading level={styles.headingLevel}>{addressHeadingText}</Heading>
          </EntityField>
        )}
        <div className="flex flex-col gap-2 text">
          {resolvedAddress && (
            <EntityField
              displayName="Address"
              fieldId={addressField.address.field}
              constantValueEnabled={addressField.address.constantValueEnabled}
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
          {coordinates && addressField.showGetDirectionsLink && (
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
        {phoneNumbersField.phoneNumber && (
          <ul className="flex flex-col gap-4">
            {phoneNumbersField.phoneNumber.map((item) => {
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
                    displayName="Phone Number"
                    fieldId={item.number.field}
                    constantValueEnabled={item.number.constantValueEnabled}
                  >
                    <div className={"flex items-center gap-3"}>
                      <div className="flex gap-2 items-center">
                        <PhoneAtom
                          backgroundColor={backgroundColors.background2.value}
                          label={item.label}
                          phoneNumber={resolvedNumber}
                          format={phoneNumbersField.phoneFormat}
                          includeHyperlink={
                            phoneNumbersField.includePhoneHyperlink
                          }
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
            displayName="Email List"
            fieldId={emailsField.emails.field}
            constantValueEnabled={emailsField.emails.constantValueEnabled}
          >
            <ul className="list-inside flex flex-col gap-4">
              {resolvedEmails
                .slice(
                  0,
                  Math.min(resolvedEmails.length, emailsField.listLength)
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
              displayName="Address"
              fieldId={hoursField.headingText.field}
              constantValueEnabled={hoursField.headingText.constantValueEnabled}
            >
              <Heading level={styles.headingLevel}>{hoursHeadingText}</Heading>
            </EntityField>
          )}
          <EntityField
            displayName="Hours"
            fieldId="hours"
            constantValueEnabled={hoursField.hours.constantValueEnabled}
          >
            <HoursTable
              hours={resolvedHours}
              startOfWeek={hoursField.startOfWeek}
              collapseDays={hoursField.collapseDays}
            />
          </EntityField>
          {additionalHoursText && hoursField.showAdditionalHoursText && (
            <EntityField displayName="Hours Text" fieldId="additionalHoursText">
              <Body className="mt-4 text-body-sm-fontSize">
                {additionalHoursText}
              </Body>
            </EntityField>
          )}
        </section>
      )}
      {servicesList && (
        <section aria-label="Services Section" className="flex flex-col gap-4">
          {servicesHeadingText && (
            <EntityField
              displayName="Address"
              fieldId={servicesField.headingText.field}
              constantValueEnabled={
                servicesField.headingText.constantValueEnabled
              }
            >
              <Heading level={styles.headingLevel}>
                {servicesHeadingText}
              </Heading>
            </EntityField>
          )}
          <EntityField
            displayName="Text List"
            fieldId={servicesField.servicesList.field}
            constantValueEnabled={
              servicesField.servicesList.constantValueEnabled
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
  defaultProps: {
    styles: {
      headingLevel: 3,
      backgroundColor: backgroundColors.background1.value,
    },
    address: {
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
      showGetDirectionsLink: true,
    },
    phoneNumbers: {
      phoneNumber: [
        {
          number: {
            field: "mainPhone",
            constantValue: "",
          },
          label: "Phone",
        },
      ],
      phoneFormat: "domestic",
      includePhoneHyperlink: true,
    },
    emails: {
      emails: {
        field: "emails",
        constantValue: [],
      },
      listLength: 1,
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
      startOfWeek: "today",
      collapseDays: false,
      showAdditionalHoursText: true,
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
  render: (props) => <CoreInfoSectionWrapper {...props} />,
};
