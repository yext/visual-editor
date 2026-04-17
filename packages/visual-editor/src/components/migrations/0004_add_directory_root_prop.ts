import { LayoutMigration } from "../../utils/migrateLayout.ts";

export const addDirectoryRootPropMigration: LayoutMigration = {
  BreadcrumbsSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          directoryRoot: "Directory Root",
        },
      };
    },
  },
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          directoryRoot: "Directory Root",
        },
      };
    },
  },
};
