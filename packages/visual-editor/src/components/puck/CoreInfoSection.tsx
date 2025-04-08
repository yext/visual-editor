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
import { FaRegEnvelope, FaPhone } from "react-icons/fa";
import {
  YextEntityField,
  HeadingLevel,
  BackgroundStyle,
  BasicSelector,
  ThemeOptions,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  Section,
  EntityField,
  Heading,
  CTA,
  backgroundColors,
  Body,
} from "../../index.js";
import { formatPhoneNumber } from "./Phone.js";

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
    phoneFormat: string;
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
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      headingLevel: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
  address: {
    label: "Info Column - Address",
    type: "object",
    objectFields: {
      headingText: YextEntityFieldSelector({
        label: "Heading Text",
        filter: {
          types: ["type.string"],
        },
      }),
      address: YextEntityFieldSelector({
        label: "Address",
        filter: {
          types: ["type.address"],
        },
      }),
      showGetDirectionsLink: {
        label: "Show Get Directions Link",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  phoneNumbers: {
    label: "Info Column - Phone",
    type: "object",
    objectFields: {
      phoneNumber: {
        label: "Phone Numbers",
        type: "array",
        arrayFields: {
          number: YextEntityFieldSelector({
            label: "Phone Number",
            filter: {
              types: ["type.phone"],
            },
          }),
          label: {
            label: "Label",
            type: "text",
          },
        },
        getItemSummary: (item) => item.label || "Item",
      },
      phoneFormat: {
        label: "Phone Format",
        type: "radio",
        options: ThemeOptions.PHONE_OPTIONS,
      },
      includePhoneHyperlink: {
        label: "Include Phone Hyperlink",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  emails: {
    label: "Info Column - Emails",
    type: "object",
    objectFields: {
      emails: YextEntityFieldSelector({
        label: "Emails",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["emails"],
        },
      }),
      listLength: { type: "number", label: "List Length", min: 0, max: 3 },
    },
  },
  hours: {
    label: "Info Column - Hours",
    type: "object",
    objectFields: {
      headingText: YextEntityFieldSelector({
        label: "Heading Text",
        filter: {
          types: ["type.string"],
        },
      }),
      hours: YextEntityFieldSelector({
        label: "Hours",
        filter: {
          types: ["type.hours"],
        },
      }),
      startOfWeek: BasicSelector(
        "Start of the Week",
        ThemeOptions.HOURS_OPTIONS
      ),
      collapseDays: {
        label: "Collapse Days",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showAdditionalHoursText: {
        label: "Show additional hours text",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  services: {
    label: "Info Column - Services",
    type: "object",
    objectFields: {
      headingText: YextEntityFieldSelector({
        label: "Heading Text",
        filter: {
          types: ["type.string"],
        },
      }),
      servicesList: YextEntityFieldSelector({
        label: "Text List",
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
          allowList: ["services"],
        },
      }),
    },
  },
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
    <Section
      className="flex flex-col gap-0 md:gap-8"
      background={styles.backgroundColor}
      aria-label="Core Info Section"
    >
      <section
        className={`flex flex-col gap-8 md:flex-row justify-between w-full`}
        aria-label="Core Info Section Wrapper"
      >
        <section
          aria-label="Information Section"
          className="flex flex-col gap-4 md:w-1/3"
        >
          {addressHeadingText && (
            <EntityField
              displayName="Headig Text"
              fieldId={addressField.headingText.field}
              constantValueEnabled={
                addressField.headingText.constantValueEnabled
              }
            >
              <Heading level={styles.headingLevel}>
                {addressHeadingText}
              </Heading>
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
                const formattedPhoneNumber: string = formatPhoneNumber(
                  resolvedNumber,
                  phoneNumbersField.phoneFormat
                );

                return (
                  <li key={item.label} className="flex gap-2 items-center">
                    <EntityField
                      displayName="Phone Number"
                      fieldId={item.number.field}
                      constantValueEnabled={item.number.constantValueEnabled}
                    >
                      <div className={"flex items-center gap-3"}>
                        <div
                          className={`h-10 w-10 flex justify-center rounded-full items-center ${backgroundColors.background2.value.bgColor} ${backgroundColors.background2.value.textColor}`}
                        >
                          <FaPhone className="w-4 h-4" />
                        </div>
                        <div className="flex gap-2 items-center">
                          <Body className="font-bold">{item.label}</Body>
                          {phoneNumbersField.includePhoneHyperlink ? (
                            <CTA
                              link={resolvedNumber}
                              label={formattedPhoneNumber || ""}
                              linkType="PHONE"
                              variant="link"
                            />
                          ) : (
                            <Body>{formattedPhoneNumber}</Body>
                          )}
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
                      <div
                        className={`h-10 w-10 flex justify-center rounded-full items-center ${backgroundColors.background2.value.bgColor} ${backgroundColors.background2.value.textColor}`}
                      >
                        <FaRegEnvelope className="w-4 h-4" />
                      </div>
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
          <section
            aria-label="Hours Section"
            className="flex flex-col gap-4 md:w-1/3"
          >
            {hoursHeadingText && (
              <EntityField
                displayName="Address"
                fieldId={hoursField.headingText.field}
                constantValueEnabled={
                  hoursField.headingText.constantValueEnabled
                }
              >
                <Heading level={styles.headingLevel}>
                  {hoursHeadingText}
                </Heading>
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
              <EntityField
                displayName="Hours Text"
                fieldId="additionalHoursText"
              >
                <Body className="mt-4 text-body-sm-fontSize">
                  {additionalHoursText}
                </Body>
              </EntityField>
            )}
          </section>
        )}
        {servicesList && (
          <section
            aria-label="Services Section"
            className="flex flex-col gap-4 md:w-1/3"
          >
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
      </section>
    </Section>
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
