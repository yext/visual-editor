import { Migration } from "../../utils/migrate.ts";

export const formHeadingDescriptionEntityFieldsMigration: Migration = {
  FormSection: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        heading: {
          field: "",
          constantValue: props.data.heading,
          constantValueEnabled: true,
        },
        description: {
          field: "",
          constantValue: props.data.description,
          constantValueEnabled: true,
        },
      },
    }),
  },
};
