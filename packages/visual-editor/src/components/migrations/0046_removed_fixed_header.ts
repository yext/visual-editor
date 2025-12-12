import { Migration } from "../../utils/migrate";

export const removeFixedHeader: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      if (props.styles?.headerPosition === "fixed") {
        props.styles.headerPosition = "sticky";
      }
      return props;
    },
  },
};
