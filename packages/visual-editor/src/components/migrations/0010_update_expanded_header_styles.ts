import { Migration } from "../../utils/migrate.ts";

export const updateExpandedHeaderStylesMigration: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          showPrimaryCTA: true,
          showSecondaryCTA: true,
        },
      };
    },
  },
};
