import { Migration } from "../../utils/migrate.ts";

export const addDirectoryRootPropMigration: Migration = {
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
