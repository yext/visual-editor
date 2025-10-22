import { Migration } from "../../utils/migrate.ts";

export const setOpenNowDefault: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        filters: {
          ...props?.filters,
          openNowButton: props?.openNow ?? false,
        },
      };
    },
  },
};
