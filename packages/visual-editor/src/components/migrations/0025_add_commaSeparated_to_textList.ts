import { Migration } from "../../utils/migrate.ts";

export const addCommaSeparatedToTextList: Migration = {
  TextList: {
    action: "updated",
    propTransformation: (props) => {
      if (props.commaSeperated === undefined) {
        props.commaSeperated = false;
      }
      return props;
    },
  },
};
