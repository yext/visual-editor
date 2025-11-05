import { Migration } from "../../utils/migrate.ts";

export const setOpenNowDefault: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        openNowButton: props?.openNow ?? false,
      };
    },
  },
};
