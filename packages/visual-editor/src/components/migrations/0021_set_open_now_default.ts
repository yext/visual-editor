import { LayoutMigration } from "../../utils/migrateLayout.ts";

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
