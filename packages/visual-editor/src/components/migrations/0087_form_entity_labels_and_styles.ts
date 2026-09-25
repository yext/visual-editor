import { Migration } from "../../utils/migrate.ts";

/** Keep saved Form labels and button styles when their editor fields change. */
export const formEntityLabelsAndStylesMigration: Migration = {
  FormSection: {
    action: "updated",
    propTransformation: (props) => {
      const { buttonVariant, ...styles } = props.styles ?? {};
      return {
        ...props,
        data: {
          ...props.data,
          phoneOptInText: {
            field: "",
            constantValue: props.data.phoneOptInText,
            constantValueEnabled: true,
          },
          submitLabel: {
            field: "",
            constantValue: props.data.submitLabel,
            constantValueEnabled: true,
          },
        },
        styles,
        ctaStyles: {
          buttonVariant: buttonVariant ?? "primary",
        },
      };
    },
  },
};
