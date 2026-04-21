import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const directoryHoursStyles: LayoutMigration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          phoneNumberFormat: "domestic",
          phoneNumberLink: true,
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
};
