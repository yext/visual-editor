import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const addHeaderPosition: LayoutMigration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          headerPosition: props?.styles?.headerPosition ?? "scrollsWithPage",
        },
      };
    },
  },
};
