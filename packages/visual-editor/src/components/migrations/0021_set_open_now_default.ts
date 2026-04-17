import { LayoutMigration } from "../../utils/migrate.ts";

export const setOpenNowDefault: LayoutMigration = {
  LocatorComponent: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        openNowButton: props?.openNow ?? false,
      };
    },
  },
};
