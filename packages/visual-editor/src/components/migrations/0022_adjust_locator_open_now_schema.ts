import { Migration } from "../../utils/migrate.ts";

export const adjustLocatorOpenNowSchema: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      // Destructure openNow out, so it's not included in the returned object
      const { openNow, ...rest } = props;
      return {
        ...rest,
        filters: {
          ...props?.filters,
          openNowButton: openNow ?? false,
        },
      };
    },
  },
};
