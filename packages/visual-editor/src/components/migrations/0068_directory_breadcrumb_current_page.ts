import { Migration } from "../../utils/migrate.ts";

export const directoryBreadcrumbCurrentPage: Migration = {
  BreadcrumbsSlot: {
    action: "updated",
    propTransformation: (props) => {
      const data = props.data ?? {};

      // if constantValue is set, don't override it
      if (data.currentPage?.constantValue) {
        return props;
      }

      return {
        ...props,
        data: {
          ...data,
          currentPage: {
            constantValue: { defaultValue: "[[name]]" },
            field: "name",
            constantValueEnabled: false,
          },
        },
      };
    },
  },
};
