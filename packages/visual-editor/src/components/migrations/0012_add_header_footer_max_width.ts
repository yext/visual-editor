import { Migration } from "../../utils/migrate.ts";

export const addHeaderFooterMaxWidth: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          maxWidth: "theme",
        },
      };
    },
  },
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          maxWidth: "theme",
        },
      };
    },
  },
};
