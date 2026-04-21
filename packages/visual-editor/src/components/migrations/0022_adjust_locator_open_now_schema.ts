import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const adjustLocatorOpenNowSchema: LayoutMigration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      // Destructure openNowButton out, so it's not included in the returned object
      const { openNowButton, ...rest } = props;
      return {
        ...rest,
        filters: {
          ...props?.filters,
          openNowButton: openNowButton ?? false,
          showDistanceOptions: false,
        },
      };
    },
  },
};
