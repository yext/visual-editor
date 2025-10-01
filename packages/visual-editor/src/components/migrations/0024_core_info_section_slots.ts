import { Migration } from "@yext/visual-editor";

export const coreInfoSectionSlots: Migration = {
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
        ctaVariant: props.styles.info.ctaVariant,
      };

      // Clean up old props
      delete props.data.info.headingText;
      delete props.data.hours.headingText;
      delete props.data.services.headingText;
      delete props.data.info.address;
      delete props.styles.heading;
      delete props.styles.info.showGetDirectionsLink;
      delete props.styles.info.ctaVariant;

      return {
        ...props,
        slots: {
          InfoHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
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
          InfoAddressSlot: [
            {
              type: "AddressSlot",
              props: {
                data: {
                  address: address,
                },
                styles: {
                  ...addressStyles,
                },
              },
            },
          ],
          HoursHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
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
          ServicesHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
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
        },
      };
    },
  },
};
