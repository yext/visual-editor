import { Migration } from "../../utils/migrate.ts";

export const refactorContentBlocks: Migration = {
  Address: {
    action: "updated",
    propTransformation: ({ address, showGetDirections, ...props }) => {
      return {
        ...props,
        data: {
          address: address,
        },
        styles: {
          showGetDirectionsLink: showGetDirections,
          ctaVariant: "link",
        },
      };
    },
  },
  BodyText: {
    action: "updated",
    propTransformation: ({ text, variant, ...props }) => {
      return {
        ...props,
        data: {
          text: text,
        },
        styles: {
          variant: variant,
        },
      };
    },
  },
  HoursTable: {
    action: "updated",
    propTransformation: ({
      hours,
      startOfWeek,
      collapseDays,
      showAdditionalHoursText,
      alignment,
      ...props
    }) => {
      return {
        ...props,
        data: {
          hours: hours,
        },
        styles: {
          startOfWeek: startOfWeek,
          collapseDays: collapseDays,
          showAdditionalHoursText: showAdditionalHoursText,
          alignment: alignment,
        },
      };
    },
  },
  ImageWrapper: {
    action: "updated",
    propTransformation: ({ image, aspectRatio, width, ...props }) => {
      return {
        ...props,
        data: {
          image: image,
        },
        styles: {
          aspectRatio: aspectRatio,
          width: width,
        },
      };
    },
  },
  Phone: {
    action: "updated",
    propTransformation: ({ phone, format, includeHyperlink, ...props }) => {
      return {
        ...props,
        data: {
          number: phone,
          label: {
            en: "Phone",
            hasLocalizedValue: "true",
          },
        },
        styles: {
          phoneFormat: format || "domestic",
          includePhoneHyperlink: includeHyperlink,
        },
      };
    },
  },
};
