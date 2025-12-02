import { Migration } from "../../utils/migrate.ts";

export const organizeCTAWrapperProps: Migration = {
  CTAWrapper: {
    action: "updated",
    propTransformation: (props) => {
      const presetImage = props.entityField?.constantValue?.presetImageType;

      return {
        id: props.id,
        className: props.className,
        data: {
          entityField: props.entityField,
        },
        styles: {
          presetImage,
          variant: props.variant,
        },
      };
    },
  },
  CTAGroup: {
    action: "updated",
    propTransformation: (props) => {
      props.buttons = props.buttons.map((cta: any) => {
        return {
          ...cta,
          presetImage: cta.entityField?.constantValue?.presetImageType,
        };
      });
      return props;
    },
  },
};
