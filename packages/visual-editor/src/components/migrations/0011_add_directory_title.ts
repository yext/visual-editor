import { Migration } from "../../utils/migrate.ts";

export const addDirectoryTitleMigration: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          title: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              en: "[[name]]",
              hasLocalizedValue: "true",
            },
          },
        },
      };
    },
  },
};
