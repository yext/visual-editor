import { Migration } from "../../utils/migrate.ts";

export const adjustLocatorOpenNowSchema: Migration = {
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
        },
      };
    },
  },
};
