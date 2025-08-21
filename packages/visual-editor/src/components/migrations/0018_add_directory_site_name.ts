import { Migration } from "../../utils/migrate.ts";

export const addDirectorySiteNameMigration: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          siteName: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              en: "",
              hasLocalizedValue: "true",
            },
          },
        },
      };
    },
  },
};
