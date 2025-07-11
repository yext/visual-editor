import { Migration } from "../../utils/migrate.ts";

export const addDirectoryTitleMigration: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          title: props.data?.title ?? "[[name]]",
        },
      };
    },
  },
};
