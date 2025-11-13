import { Migration } from "../../utils/migrate.ts";

export const addCommaSeparatedToTextList: Migration = {
  TextList: {
    action: "updated",
    propTransformation: (props) => {
      if (props.commaSeparated === undefined) {
        props.commaSeparated = false;
      }
      return props;
    },
  },
};
