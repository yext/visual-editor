import { LayoutMigration } from "../../utils/migrateLayout.ts";
export const updateExpandedHeaderStylesMigration: LayoutMigration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          primaryHeader: {
            ...props.data.primaryHeader,
            showPrimaryCTA: true,
            showSecondaryCTA: true,
          },
        },
      };
    },
  },
};
