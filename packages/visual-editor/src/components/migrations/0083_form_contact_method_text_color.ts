import { Migration } from "../../utils/migrate.ts";

export const formContactMethodTextColorMigration: Migration = {
  FormSection: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: {
        ...props.styles,
        preferredContactMethodTextColor:
          props.styles?.preferredContactMethodTextColor,
      },
    }),
  },
};
