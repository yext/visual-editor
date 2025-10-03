import { Migration } from "../../utils/migrate.ts";

export const organizeCTAWrapperProps: Migration = {
  CTAWrapper: {
    action: "updated",
    propTransformation: (props) => {
      return {
        id: props.id,
        className: props.className,
        data: {
          entityField: props.entityField,
        },
        styles: {
          variant: props.variant,
        },
      };
    },
  },
};
