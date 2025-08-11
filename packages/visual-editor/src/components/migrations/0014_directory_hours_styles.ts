import { Migration } from "../../utils/migrate.ts";

export const directoryHoursStyles: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          hours: {
            showCurrentStatus: true,
            timeFormat: "12h",
            showDayNames: true,
            dayOfWeekFormat: "long",
          },
        },
      };
    },
  },
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: (props) => {
      const { phoneNumberFormat, phoneNumberLink, hours, cards, ...styles } =
        props.styles || {};

      return {
        ...props,
        styles: {
          ...styles,
          cards: {
            ...cards,
            phoneNumberFormat: phoneNumberFormat ?? "domestic",
            phoneNumberLink: phoneNumberLink ?? true,
            hours: {
              showCurrentStatus: true,
              timeFormat: "12h",
              showDayNames: true,
              dayOfWeekFormat: "long",
              ...hours,
            },
          },
        },
      };
    },
  },
};
