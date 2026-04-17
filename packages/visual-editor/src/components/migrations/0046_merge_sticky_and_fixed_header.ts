import { LayoutMigration } from "../../utils/migrate.ts";

export const mergeStickyAndFixedHeader: LayoutMigration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      if (props.styles?.headerPosition === "sticky") {
        props.styles.headerPosition = "fixed";
      }
      return props;
    },
  },
};
