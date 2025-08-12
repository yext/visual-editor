import { Migration } from "../../utils/migrate.ts";

export const addHeaderPosition: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          headerPosition: "scrollsWithPage",
        },
      };
    },
  },
};
