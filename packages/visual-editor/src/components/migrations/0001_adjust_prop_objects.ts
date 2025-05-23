import { Migration } from "../../utils/migrate.ts";

export const adjustPropObjectsMigration: Migration = {
  BannerSection: {
    action: "updated",
    propTransformation: ({
      text,
      textAlignment,
      backgroundColor,
      ...props
    }) => ({
      data: { text: text },
      styles: {
        backgroundColor: backgroundColor,
        textAlignment: textAlignment,
      },
      ...props,
    }),
  },
  CoreInfoSection: {
    action: "updated",
    propTransformation: ({
      address,
      phoneNumbers,
      emails,
      hours,
      services,
      styles,
      ...props
    }) => ({
      data: {
        info: {
          headingText: address?.headingText,
          address: address?.address,
          phoneNumbers: phoneNumbers?.phoneNumber,
          emails: emails?.emails,
        },
        hours: {
          headingText: hours?.headingText,
          hours: hours?.hours,
        },
        services: {
          headingText: services?.headingText,
          servicesList: services?.servicesList,
        },
      },
      styles: {
        ...styles,
        info: {
          showGetDirectionsLink: address?.showGetDirectionsLink,
          phoneFormat: phoneNumbers?.phoneFormat,
          includePhoneHyperlink: phoneNumbers?.includePhoneHyperlink,
          emailsListLength: emails?.listLength,
        },
        hours: {
          startOfWeek: hours?.startOfWeek,
          collapseDays: hours?.collapseDays,
          showAdditionalHoursText: hours?.showAdditionalHoursText,
        },
      },
      ...props,
    }),
  },
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: ({
      heading,
      cards,
      styles,
      coordinate,
      radius,
      limit,
      ...props
    }) => ({
      data: {
        heading: heading?.text,
        coordinate: coordinate,
        radius: radius,
        limit: limit,
      },
      styles: {
        ...styles,
        headingLevel: heading?.level,
        cardHeadingLevel: cards?.headingLevel,
        phoneNumberFormat: cards?.phoneNumberFormat,
        phoneNumberLink: cards?.phoneNumberLink,
        hours: cards?.hours,
      },
      ...props,
    }),
  },
  PhotoGallerySection: {
    action: "updated",
    propTransformation: ({ styles, sectionHeading, images, ...props }) => ({
      data: {
        heading: sectionHeading?.text,
        images: images?.images,
      },
      styles: {
        ...styles,
        headingLevel: sectionHeading?.level,
        imageStyle: images?.imageStyle,
      },
      ...props,
    }),
  },
  StaticMapSection: {
    action: "updated",
    propTransformation: ({ apiKey, ...props }) => ({
      data: { apiKey: apiKey },
      ...props,
    }),
  },
};
