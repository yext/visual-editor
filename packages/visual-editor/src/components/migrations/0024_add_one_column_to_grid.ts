import { Migration } from "../../utils/migrate.ts";

export const addOneColumnToGrid: Migration = {
  Grid: {
    action: "updated",
    propTransformation: (props) => {
      const newProps = { ...props };
      if (newProps.align === undefined) {
        newProps.align = "left";
      }
      return newProps;
    },
  },
};
