import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate.ts";
import { CTAGroupProps } from "../contentBlocks/CTAGroup.tsx";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";

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
      } satisfies WithId<CTAWrapperProps>;
    },
  },
  CTAGroup: {
    action: "updated",
    propTransformation: (props) => {
      props.buttons = props.buttons.map((cta: any) => {
        return {
          ...cta,
          presetImage: cta.entityField?.constantValue?.presetImageType,
        } satisfies CTAGroupProps;
      });
      return props;
    },
  },
};
