import { Migration } from "../../utils/migrate.ts";

export const addDirectoryRootPropMigration: Migration = {
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
