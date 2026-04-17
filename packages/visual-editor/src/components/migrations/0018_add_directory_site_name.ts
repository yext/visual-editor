import { LayoutMigration } from "../../utils/migrate.ts";

export const addDirectorySiteNameMigration: LayoutMigration = {
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
