import { Migration } from "@yext/visual-editor";

export const coreInfoSectionSlots: Migration = {
  Emails: {
    action: "updated",
    propTransformation: (props) => {
      return {
        id: props.id,
        data: {
          list: props.list,
        },
        styles: {
          listLength: props.listLength ?? 1,
        },
      };
    },
  },
  CoreInfoSection: {
    action: "updated",
    propTransformation: (props) => {
      const infoHeadingText = props.data.info.headingText ?? {
        constantValue: {
          en: "Information",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
        field: "",
      };
      const hoursHeadingText = props.data.hours.headingText ?? {
        constantValue: {
          en: "Hours",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
        field: "",
      };
      const servicesHeadingText = props.data.services.headingText ?? {
        constantValue: {
          en: "Services",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
        field: "",
      };
      const headingLevel = props.styles.heading?.level ?? 3;
      const headingAlign = props.styles.heading?.align ?? "left";

      const address = props.data.info.address ?? {
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
        },
        field: "address",
      };
      const addressStyles = {
        showGetDirectionsLink: props.styles.info.showGetDirectionsLink ?? true,
        ctaVariant: props.styles.info.ctaVariant ?? "link",
      };

      const phoneNumbers = props.data.info.phoneNumbers;
      const phoneStyles = {
        phoneFormat: props.styles.info.phoneFormat,
        includePhoneHyperlink: props.styles.info.includePhoneHyperlink,
      };

      const emails = props.data.info.emails;
      const emailStyles = props.styles.info.emailsListLength;

      const hours = props.data.hours?.hours ?? {
        field: "hours",
        constantValue: {},
      };
      const hoursStyles = props.styles.hours ?? {
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: true,
        alignment: "items-start",
      };

      const services = props.data.services.servicesList;

      // Clean up old props
      delete props.data;
      delete props.styles.heading;
      delete props.styles.info;
      delete props.styles.hours;

      return {
        ...props,
        slots: {
          CoreInfoHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-InfoHeadingSlot`,
                data: {
                  text: infoHeadingText,
                },
                styles: {
                  level: headingLevel,
                  align: headingAlign,
                },
              },
            },
          ],
          CoreInfoAddressSlot: [
            {
              type: "AddressSlot",
              props: {
                id: `${props.id}-AddressSlot`,
                data: {
                  address: address,
                },
                styles: {
                  ...addressStyles,
                },
              },
            },
          ],
          CoreInfoPhoneNumbersSlot: [
            {
              type: "PhoneNumbersSlot",
              props: {
                id: `${props.id}-PhoneNumbersSlot`,
                data: {
                  phoneNumbers: phoneNumbers,
                },
                styles: { ...phoneStyles },
              },
            },
          ],
          CoreInfoEmailsSlot: [
            {
              type: "EmailsSlot",
              props: {
                id: `${props.id}-EmailsSlot`,
                data: {
                  list: emails,
                },
                styles: {
                  listLength: emailStyles,
                },
              },
            },
          ],
          HoursHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-HoursHeadingSlot`,
                data: {
                  text: hoursHeadingText,
                },
                styles: {
                  level: headingLevel,
                  align: headingAlign,
                },
              },
            },
          ],
          HoursTableSlot: [
            {
              type: "HoursTableSlot",
              props: {
                id: `${props.id}-HoursTableSlot`,
                data: {
                  hours: hours,
                },
                styles: {
                  ...hoursStyles,
                },
              },
            },
          ],
          ServicesHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-ServicesHeadingSlot`,
                data: {
                  text: servicesHeadingText,
                },
                styles: {
                  level: headingLevel,
                  align: headingAlign,
                },
              },
            },
          ],
          TextListSlot: [
            {
              type: "TextListSlot",
              props: {
                id: `${props.id}-ServicesListSlot`,
                list: services,
              },
            },
          ],
        },
      };
    },
  },
};
