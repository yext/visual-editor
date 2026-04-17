import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const addDirectoryTitleMigration: LayoutMigration = {
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
